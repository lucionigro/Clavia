import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DOMParser } from "@xmldom/xmldom";
import { zipSync, strToU8 } from "fflate";
import { parseMusicXML, readMusicXMLFile } from "../musicxml-file.js";
import { scoreFromMIDI } from "../midi-file.js";
import { scoreSVG, notationParts } from "../guided-ui.js";
import { PracticeSession } from "../guided-score.js";
import { validateImportedPiece } from "../library-store.js";
const wrap = (body) =>
  `<score-partwise version="4.0"><part-list><score-part id="P"><part-name>Piano</part-name></score-part></part-list><part id="P">${body}</part></score-partwise>`;
const attrs = (n = 4, d = 4) =>
  `<attributes><divisions>12</divisions><time><beats>${n}</beats><beat-type>${d}</beat-type></time></attributes>`;
const note = (step = "C", duration = 12, extra = "", octave = 4) =>
  `<note><pitch><step>${step}</step><octave>${octave}</octave></pitch><duration>${duration}</duration>${extra}</note>`;
test("MusicXML con dos pentagramas genera una guía con melodía y bajo reales", () => {
  const p = parseMusicXML(
    readFileSync("examples/primer-dialogo.musicxml", "utf8"),
    DOMParser,
  );
  assert.equal(p.tracks.length, 2);
  assert.equal(p.tracks[1].suggestedHand, "left");
  assert.equal(p.bars, 4);
  const s = scoreFromMIDI(p, { 0: "right", 1: "left" }, { to: 4 });
  assert.equal(s.notes.length, 17);
  assert.equal(s.notes.find((n) => n.hand === "left").duration, 4);
  assert.match(scoreSVG(s), /IZQUIERDA/);
  const validated = validateImportedPiece({
    id: "import-test-xml",
    title: p.title,
    artist: "Clavia",
    format: "musicxml",
    score: s,
  });
  assert.equal(validated.format, "musicxml");
  assert.equal(validated.score.notes.find((n) => n.pitch === 60).label, "Do4");
});
test("Voces, backup y acordes preservan eventos simultáneos de cada pentagrama", () => {
  const p = parseMusicXML(
    wrap(
      `<measure>${attrs()}${note("C", 24, "<voice>1</voice><staff>1</staff>")}<note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>24</duration><voice>1</voice><staff>1</staff></note>${note("G", 24, "<voice>1</voice><staff>1</staff>")}<backup><duration>48</duration></backup>${note("C", 48, "<voice>2</voice><staff>2</staff>", 3)}</measure>`,
    ),
    DOMParser,
  );
  const s = scoreFromMIDI(p, { 0: "right", 1: "left" }, { to: 1 });
  assert.equal(s.notes.filter((n) => n.start === 0).length, 3);
  assert.equal(s.notes.find((n) => n.pitch === 67).start, 2);
  assert.equal(s.notes.find((n) => n.hand === "left").duration, 4);
});
test("Ligadura entre compases contiguos: no pide volver a tocar la misma tecla", () => {
  const p = parseMusicXML(
    wrap(
      `<measure>${attrs()}${note("C", 48, '<tie type="start"/>')}</measure><measure>${note("C", 48, '<tie type="stop"/>')}</measure>`,
    ),
    DOMParser,
  );
  assert.equal(p.tracks[0].notes.length, 1);
  assert.equal(p.tracks[0].notes[0].duration, 8);
  const s = scoreFromMIDI(p, { 0: "right" }, { to: 2 });
  assert.equal(s.notes.length, 1);
  assert.equal(notationParts(s).length, 2);
});
test("Puntillos, semicorcheas, tresillos y compás compuesto tienen representación explícita", () => {
  const p = parseMusicXML(
    wrap(
      `<measure>${attrs(6, 8)}${note("C", 18)}${note("D", 3)}${note("E", 3)}${note("F", 4, "<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>")}${note("G", 4, "<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>")}${note("A", 4, "<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>")}</measure>`,
    ),
    DOMParser,
  );
  assert.equal(p.meter, 3);
  assert.equal(p.timeSignature, "6/8");
  const s = scoreFromMIDI(p, { 0: "right" }, { to: 1 }),
    svg = scoreSVG(s);
  assert.match(svg, /score-dot/);
  assert.match(svg, /score-tuplet/);
  assert.match(svg, /Compás de 6 por ocho/);
  assert.ok(notationParts(s).some((n) => n.displayDuration === 0.25));
});
test("MXL comprimido se lee por su índice y se limita antes de descomprimir archivos grandes", () => {
  const xml = readFileSync("examples/primer-dialogo.musicxml", "utf8"),
    container =
      '<container><rootfiles><rootfile full-path="score.musicxml" media-type="application/vnd.recordare.musicxml+xml"/></rootfiles></container>';
  const zip = zipSync({
    "META-INF/container.xml": strToU8(container),
    "score.musicxml": strToU8(xml),
  });
  const p = readMusicXMLFile(zip.buffer, "example.mxl", DOMParser);
  assert.equal(p.title, "Primer diálogo");
  const huge = zipSync({
    "META-INF/container.xml": strToU8(container),
    "score.musicxml": new Uint8Array(8_000_001),
  });
  assert.throws(
    () => readMusicXMLFile(huge.buffer, "huge.mxl", DOMParser),
    /límite/,
  );
});
test("XML con entidades, compases cambiantes y duración inválida se rechaza", () => {
  assert.throws(
    () =>
      parseMusicXML(
        '<!DOCTYPE score-partwise [<!ENTITY x SYSTEM "file:///x">]><score-partwise/>',
        DOMParser,
      ),
    /entidades/,
  );
  assert.throws(
    () =>
      parseMusicXML(
        wrap(`<measure>${attrs()}${note("C", 0)}</measure>`),
        DOMParser,
      ),
    /duraciones/,
  );
  assert.throws(
    () =>
      parseMusicXML(
        wrap(
          `<measure>${attrs()}${note()}</measure><measure>${attrs(3, 4)}${note()}</measure>`,
        ),
        DOMParser,
      ),
    /cambia de compás/,
  );
  assert.throws(
    () => parseMusicXML("<score-timewise/>", DOMParser),
    /partwise/,
  );
});
test("Las tolerancias de semicorcheas no aceptan pulsar y soltar instantáneamente", () => {
  const score = {
    title: "Semicorcheas",
    meter: 4,
    bars: 1,
    notes: [{ id: "n", pitch: 60, start: 0, duration: 0.25, hand: "right" }],
  };
  const step = new PracticeSession(score, { bpm: 120 });
  step.on(60, 0);
  step.off(60, 3);
  assert.equal(step.summary().passed, false);
  const timed = new PracticeSession(score, { bpm: 120, mode: "timed" });
  timed.on(60, 0);
  timed.off(60, 125);
  assert.equal(timed.summary().passed, true);
});
test("Ataques de subdivisiones tienen ventanas proporcionales y no se aprueban todos al principio", () => {
  const score = {
    title: "Dos notas",
    meter: 4,
    bars: 1,
    notes: [
      { id: "a", pitch: 60, start: 0, duration: 0.25, hand: "right" },
      { id: "b", pitch: 62, start: 0.25, duration: 0.25, hand: "right" },
    ],
  };
  const s = new PracticeSession(score, { bpm: 120, mode: "timed" });
  s.on(62, 0);
  assert.equal(s.errors[0].type, "pitch");
  s.tick(200);
  assert.equal(s.results.get("b").state, "missed");
});
