import { unzipSync } from "./vendor/fflate.js";
const children = (node, name) =>
  Array.from(node?.childNodes || []).filter(
    (n) => n.nodeType === 1 && (!name || n.localName === name),
  );
const one = (node, name) => children(node, name)[0];
const content = (node, name, fallback = "") =>
  one(node, name)?.textContent?.trim() || fallback;
const number = (node, name, fallback = 0) =>
  Number(content(node, name, String(fallback)));
const letters = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 },
  names = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si" };
function xmlDocument(text, Parser = globalThis.DOMParser) {
  if (!Parser) throw Error("Este navegador no puede leer XML.");
  if (text.length > 8_000_000 || /<!ENTITY|<!DOCTYPE[^>]*\[/i.test(text))
    throw Error("El XML contiene entidades o es demasiado grande.");
  // Los DTD estándar de MusicXML son declarativos. Nunca se consultan URLs externas.
  text = text.replace(/<!DOCTYPE(?:[^>"']|"[^"]*"|'[^']*')*>/gi, "");
  let doc;
  try {
    doc = new Parser().parseFromString(text, "application/xml");
  } catch {
    throw Error("El MusicXML está incompleto o no es válido.");
  }
  if (!doc?.documentElement || doc.getElementsByTagName("parsererror").length)
    throw Error("El MusicXML está incompleto o no es válido.");
  return doc;
}
export function parseMusicXML(text, Parser) {
  const doc = xmlDocument(text, Parser),
    root = doc.documentElement;
  if (root.localName !== "score-partwise")
    throw Error("Exportá la partitura como MusicXML partwise desde tu editor.");
  const partNames = new Map(
    children(one(root, "part-list"), "score-part").map((p) => [
      p.getAttribute("id"),
      content(p, "part-name", "Instrumento"),
    ]),
  );
  let meter,
    timeSignature,
    bpm = 60,
    noteCount = 0,
    graceCount = 0,
    repeatCount = 0,
    tempoChanges = false,
    foundTempo = false;
  const tracks = [],
    warningSet = new Set();
  const parts = children(root, "part");
  if (!parts.length || parts.length > 32)
    throw Error("La partitura debe tener entre 1 y 32 instrumentos.");
  for (const [partIndex, part] of parts.entries()) {
    let divisions = 1,
      origin = 0;
    const trackMap = new Map(),
      ties = new Map();
    const measures = children(part, "measure");
    if (measures.length > 512)
      throw Error("Exportá una selección de hasta 512 compases.");
    for (const measure of measures) {
      let cursor = 0,
        maxCursor = 0,
        lastStart = 0;
      for (const item of children(measure)) {
        if (item.localName === "attributes") {
          if (one(item, "divisions")) {
            divisions = number(item, "divisions");
            if (!Number.isFinite(divisions) || divisions <= 0)
              throw Error("Divisiones MusicXML inválidas.");
          }
          const time = one(item, "time");
          if (time) {
            const n = number(time, "beats"),
              d = number(time, "beat-type");
            if (
              ![
                [2, 4],
                [3, 4],
                [4, 4],
                [6, 8],
                [9, 8],
                [12, 8],
              ].some(([a, b]) => a === n && b === d)
            )
              throw Error(
                "Se admiten 2/4, 3/4, 4/4, 6/8, 9/8 y 12/8 constantes.",
              );
            const signature = `${n}/${d}`;
            if (timeSignature && signature !== timeSignature)
              throw Error(
                "La partitura cambia de compás. Exportá cada sección por separado.",
              );
            timeSignature = signature;
            meter = (n * 4) / d;
          }
          const transpose = one(item, "transpose");
          if (
            transpose &&
            (number(transpose, "chromatic") ||
              number(transpose, "octave-change"))
          )
            throw Error(
              "Exportá la parte de teclado en tono de concierto, sin transposición de instrumento.",
            );
          continue;
        }
        if (!meter) {
          meter = 4;
          timeSignature = "4/4";
        }
        if (item.localName === "backup" || item.localName === "forward") {
          const duration = number(item, "duration") / divisions;
          if (!Number.isFinite(duration) || duration < 0)
            throw Error("Duración de voz inválida.");
          cursor += (item.localName === "backup" ? -1 : 1) * duration;
          if (cursor < -0.00001)
            throw Error("Las voces del MusicXML salen del compás.");
          continue;
        }
        if (item.localName === "direction") {
          const sound = one(item, "sound"),
            tempo = Number(sound?.getAttribute("tempo"));
          if (tempo > 0 && Number.isFinite(tempo)) {
            if (foundTempo && Math.abs(tempo - bpm) > 0.5) tempoChanges = true;
            if (!foundTempo) {
              bpm = tempo;
              foundTempo = true;
            }
          }
          continue;
        }
        if (item.localName === "barline") {
          if (one(item, "repeat")) repeatCount++;
          continue;
        }
        if (item.localName !== "note") continue;
        if (one(item, "grace")) {
          graceCount++;
          continue;
        }
        const duration = number(item, "duration") / divisions;
        if (
          !Number.isFinite(duration) ||
          duration <= 0 ||
          duration < 1 / 24 ||
          Math.abs(duration * 24 - Math.round(duration * 24)) > 1e-5
        )
          throw Error(
            "Hay duraciones no compatibles. Se admiten figuras hasta fusa y tresillos de corchea/semicorchea.",
          );
        const chord = !!one(item, "chord"),
          start = chord ? lastStart : cursor;
        if (!chord) {
          lastStart = cursor;
          cursor += duration;
        }
        maxCursor = Math.max(maxCursor, start + duration);
        if (one(item, "rest")) continue;
        const p = one(item, "pitch");
        if (!p)
          throw Error(
            "La partitura contiene percusión o notas sin altura. Elegí la parte de piano.",
          );
        const step = content(p, "step"),
          octave = number(p, "octave", NaN),
          alter = number(p, "alter");
        if (
          !(step in letters) ||
          !Number.isInteger(octave) ||
          !Number.isInteger(alter) ||
          Math.abs(alter) > 2
        )
          throw Error("Altura o alteración MusicXML no compatible.");
        const pitch = (octave + 1) * 12 + letters[step] + alter;
        if (pitch < 0 || pitch > 127) throw Error("Nota fuera del rango MIDI.");
        const staff = number(item, "staff", 1),
          voice = content(item, "voice", "1");
        if (!Number.isInteger(staff) || staff < 1 || staff > 8)
          throw Error("Pentagrama inválido.");
        const key = `${partIndex}-${staff}`;
        if (!trackMap.has(key))
          trackMap.set(key, {
            id: tracks.length + trackMap.size,
            name: `${partNames.get(part.getAttribute("id")) || "Piano"} · pentagrama ${staff}`,
            staff,
            notes: [],
            suggestedHand:
              staff === 2 ? "left" : staff === 1 ? "right" : "skip",
          });
        const track = trackMap.get(key),
          tieNodes = [
            ...children(item, "tie"),
            ...children(one(item, "notations"), "tied"),
          ],
          stop = tieNodes.some((t) => t.getAttribute("type") === "stop"),
          begin = tieNodes.some((t) => t.getAttribute("type") === "start"),
          tieKey = `${staff}-${voice}-${pitch}`;
        const absolute = origin + start,
          previous = ties.get(tieKey);
        if (stop && previous) {
          if (Math.abs(previous.start + previous.duration - absolute) > 1e-5)
            throw Error(
              "Hay una ligadura con tiempos inconsistentes. Revisá la partitura.",
            );
          previous.duration = absolute + duration - previous.start;
          if (!begin) ties.delete(tieKey);
          continue;
        }
        if (stop && !previous)
          warningSet.add(
            "El archivo comienza con una ligadura previa: se practica como un ataque inicial.",
          );
        const technical = one(one(item, "notations"), "technical"),
          finger = Number(content(technical, "fingering"));
        const note = {
          pitch,
          start: absolute,
          duration,
          label:
            names[step] +
            (alter > 0 ? "♯".repeat(alter) : "♭".repeat(-alter)) +
            octave,
        };
        if (finger >= 1 && finger <= 5 && Number.isInteger(finger))
          note.finger = finger;
        const modification = one(item, "time-modification");
        if (modification) {
          const actual = number(modification, "actual-notes"),
            normal = number(modification, "normal-notes");
          if (actual !== 3 || normal !== 2)
            throw Error(
              "Por ahora se admiten tresillos 3:2; exportá otros grupos especiales por separado.",
            );
          note.tuplet = 3;
        }
        track.notes.push(note);
        if (begin) ties.set(tieKey, note);
        if (++noteCount > 10000)
          throw Error("Exportá una selección de hasta 10.000 notas.");
      }
      if (maxCursor > meter + 0.00001)
        throw Error(
          "Un compás tiene más duración que la indicación. Revisá voces o exportá una versión corregida.",
        );
      if (origin === 0 && maxCursor > 0 && maxCursor < meter - 0.00001) {
        const pickup = meter - maxCursor;
        for (const track of trackMap.values())
          for (const n of track.notes) if (n.start < meter) n.start += pickup;
        warningSet.add(
          "La anacrusa se ubica al final del primer compás, con silencios de preparación al inicio.",
        );
      }
      origin += meter;
    }
    if (ties.size)
      warningSet.add(
        "El archivo termina con ligaduras abiertas; se sostienen hasta la última duración escrita.",
      );
    for (const track of trackMap.values())
      if (track.notes.length) {
        track.low = Math.min(...track.notes.map((n) => n.pitch));
        track.high = Math.max(...track.notes.map((n) => n.pitch));
        tracks.push(track);
      }
  }
  if (!tracks.length) throw Error("No se encontraron notas de piano.");
  if (graceCount)
    warningSet.add(
      `${graceCount} notas de adorno se omiten en la guía. Estudialas con la partitura original.`,
    );
  if (repeatCount)
    warningSet.add(
      "Las repeticiones y saltos se leen una sola vez, en orden escrito. Exportá una versión desplegada para practicarlos completos.",
    );
  warningSet.add(
    "La guía conserva alturas, voces asignadas y duraciones; no reproduce todo el grabado, pedal, dinámica u ornamentos de la edición.",
  );
  const title =
    content(one(root, "work"), "work-title") ||
    content(root, "movement-title") ||
    "Mi partitura";
  const composer =
    children(one(root, "identification"), "creator")
      .find((n) => n.getAttribute("type") === "composer")
      ?.textContent?.trim() || "";
  return {
    format: "musicxml",
    title: title.slice(0, 100),
    composer: composer.slice(0, 100),
    meter,
    timeSignature,
    bpm: Math.round(bpm),
    tempoChanges,
    tracks,
    warnings: [...warningSet],
    bars: Math.max(...parts.map((p) => children(p, "measure").length)),
  };
}
export function readMusicXMLFile(buffer, name, Parser) {
  if (buffer.byteLength > 8_000_000) throw Error("La partitura supera 8 MB.");
  const bytes = new Uint8Array(buffer);
  let text;
  if (name.toLowerCase().endsWith(".mxl")) {
    let total = 0,
      count = 0;
    const archive = unzipSync(bytes, {
      filter: (entry) => {
        if (
          ++count > 200 ||
          entry.originalSize > 8_000_000 ||
          (total += entry.originalSize) > 12_000_000
        )
          throw Error("El MXL descomprimido supera el límite seguro.");
        return true;
      },
    });
    const container = archive["META-INF/container.xml"];
    if (!container) throw Error("El MXL no contiene su índice MusicXML.");
    const doc = xmlDocument(
      new TextDecoder("utf-8", { fatal: true }).decode(container),
      Parser,
    );
    const files = Array.from(doc.getElementsByTagName("rootfile"));
    const filename =
      files
        .find(
          (f) =>
            f.getAttribute("media-type") ===
            "application/vnd.recordare.musicxml+xml",
        )
        ?.getAttribute("full-path") || files[0]?.getAttribute("full-path");
    if (!filename || filename.split("/").includes("..") || !archive[filename])
      throw Error("No se encontró la partitura dentro del MXL.");
    text = new TextDecoder("utf-8", { fatal: true }).decode(archive[filename]);
  } else {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }
  return parseMusicXML(text, Parser);
}
