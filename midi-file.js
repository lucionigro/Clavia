/** Lector SMF 0/1 local. Sin red, SysEx, ejecución ni dependencia de nombres de pista. */
export function parseMIDI(input) {
  const bytes = new Uint8Array(input);
  if (bytes.length > 2_000_000)
    throw Error("El MIDI supera 2 MB. Exportá solo la parte de piano.");
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let pos = 0;
  const requireBytes = (n) => {
    if (pos + n > bytes.length) throw Error("El archivo MIDI está incompleto.");
  };
  const u8 = () => {
    requireBytes(1);
    return bytes[pos++];
  };
  const u16 = () => {
    requireBytes(2);
    const n = v.getUint16(pos);
    pos += 2;
    return n;
  };
  const u32 = () => {
    requireBytes(4);
    const n = v.getUint32(pos);
    pos += 4;
    return n;
  };
  const str = (n) => {
    requireBytes(n);
    const s = String.fromCharCode(...bytes.slice(pos, pos + n));
    pos += n;
    return s;
  };
  const vlq = () => {
    let n = 0;
    for (let i = 0; i < 4; i++) {
      const b = u8();
      n = (n << 7) | (b & 127);
      if (!(b & 128)) return n;
    }
    throw Error("Longitud MIDI inválida.");
  };
  if (str(4) !== "MThd")
    throw Error("Elegí un archivo MIDI estándar (.mid o .midi).");
  const header = u32();
  if (header < 6) throw Error("Cabecera MIDI inválida.");
  requireBytes(header);
  const format = u16(),
    trackCount = u16(),
    ppq = u16();
  if (format > 1 || !trackCount || trackCount > 128 || !ppq || ppq & 0x8000)
    throw Error("Se admiten MIDI tipo 0 o 1 con tiempo musical PPQ.");
  pos += header - 6;
  const tracks = [],
    tempos = [],
    meters = [];
  let noteCount = 0,
    unclosed = 0;
  for (let t = 0; t < trackCount; t++) {
    if (str(4) !== "MTrk") throw Error("Pista MIDI inválida.");
    const length = u32();
    requireBytes(length);
    const end = pos + length;
    let tick = 0,
      running = 0,
      name = `Pista ${t + 1}`;
    const active = new Map(),
      notes = [];
    while (pos < end) {
      tick += vlq();
      let status = u8();
      if (status < 128) {
        if (!running) throw Error("Evento MIDI sin estado.");
        pos--;
        status = running;
      }
      if (status === 255) {
        running = 0;
        const type = u8(),
          len = vlq();
        requireBytes(len);
        if (pos + len > end) throw Error("Evento fuera de pista.");
        if (type === 3)
          name =
            new TextDecoder()
              .decode(bytes.slice(pos, pos + len))
              .replace(/[\x00-\x1f]/g, "")
              .slice(0, 80) || name;
        if (type === 81 && len === 3) {
          const us =
            (bytes[pos] << 16) | (bytes[pos + 1] << 8) | bytes[pos + 2];
          if (us) tempos.push({ tick, bpm: 60_000_000 / us });
        }
        if (type === 88 && len >= 2)
          meters.push({ tick, n: bytes[pos], d: 2 ** bytes[pos + 1] });
        pos += len;
        if (type === 47) break;
        continue;
      }
      if (status === 240 || status === 247) {
        running = 0;
        const len = vlq();
        requireBytes(len);
        pos += len;
        if (pos > end) throw Error("SysEx fuera de pista.");
        continue;
      }
      if (status >= 240) throw Error("Evento MIDI no compatible.");
      running = status;
      const kind = status >> 4,
        channel = status & 15,
        pitch = u8(),
        value = kind === 12 || kind === 13 ? 0 : u8();
      if (pitch > 127 || value > 127) throw Error("Datos MIDI inválidos.");
      if (channel === 9) continue;
      const key = `${channel}:${pitch}`;
      if (kind === 9 && value > 0) {
        if (active.has(key))
          throw Error(
            "El MIDI repite una nota antes de soltarla. Exportá una parte de piano sin notas superpuestas de igual altura.",
          );
        active.set(key, { pitch, start: tick, velocity: value });
      }
      if (kind === 8 || (kind === 9 && value === 0)) {
        const n = active.get(key);
        if (n) {
          active.delete(key);
          if (tick > n.start) notes.push({ ...n, duration: tick - n.start });
          if (++noteCount > 10000)
            throw Error(
              "Hay demasiadas notas. Importá un fragmento más corto.",
            );
        }
      }
      if (pos > end) throw Error("Evento fuera de pista.");
    }
    unclosed += active.size;
    pos = end;
    if (notes.length)
      tracks.push({
        id: t,
        name,
        notes: notes.map((n) => ({
          ...n,
          start: n.start / ppq,
          duration: n.duration / ppq,
        })),
        low: Math.min(...notes.map((n) => n.pitch)),
        high: Math.max(...notes.map((n) => n.pitch)),
      });
  }
  if (!tracks.length) throw Error("No hay notas de instrumentos en este MIDI.");
  if (unclosed)
    throw Error(
      "Hay notas sin liberación. Volvé a exportar el MIDI con sus note-off.",
    );
  meters.sort((a, b) => a.tick - b.tick);
  tempos.sort((a, b) => a.tick - b.tick);
  const initial = meters.find((m) => m.tick === 0) || { n: 4, d: 4 };
  if (
    ![[2,4],[3,4],[4,4],[6,8],[9,8],[12,8]].some(([n,d])=>initial.n===n&&initial.d===d) ||
    meters.some(m=>m.n!==initial.n||m.d!==initial.d)
  ) throw Error("Se admiten compases constantes: 2/4, 3/4, 4/4, 6/8, 9/8 o 12/8.");
  return {
    tracks,
    meter: initial.n*4/initial.d,
    timeSignature: `${initial.n}/${initial.d}`,
    bpm: Math.round(tempos[0]?.bpm || 120),
    tempoChanges: tempos.some(
      (t) => Math.abs(t.bpm - (tempos[0]?.bpm || 120)) > 0.5,
    ),
  };
}
export function scoreFromMIDI(
  parsed,
  assignments,
  { title = "Mi canción", from = 1, to = 8, split = 60, quantum = parsed.format === "musicxml" ? 1/24 : .5, range=[21,108], maxBars=128 } = {},
) {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 1 ||
    to < from ||
    to - from >= maxBars
  )
    throw Error("Elegí un pasaje de 1 a 128 compases.");
  const meter = parsed.meter,
    start = (from - 1) * meter,
    end = to * meter,
    notes = [];
  for (const track of parsed.tracks) {
    const hand = assignments[track.id];
    if (!["left", "right", "split"].includes(hand)) continue;
    for (const n of track.notes) {
      const a = Math.round(n.start / quantum) * quantum,
        b = Math.max(a + quantum, Math.round((n.start + n.duration) / quantum) * quantum);
      if (a >= end || b <= start) continue;
      if (n.pitch < range[0] || n.pitch > range[1])
        throw Error(
          "El pasaje sale del rango elegido para el instrumento. Elegí otras pistas, compases o corregí el registro en Ajustes.",
        );
      notes.push({
        ...(n.label ? {label:n.label} : {}),
        ...(n.finger ? {finger:n.finger} : {}),
        ...(n.tuplet ? {tuplet:n.tuplet} : {}),
        id: `midi-${notes.length}`,
        pitch: n.pitch,
        start: Math.max(a, start) - start,
        duration: Math.min(b, end) - Math.max(a, start),
        hand: hand === "split" ? (n.pitch < split ? "left" : "right") : hand,
      });
    }
  }
  if (!notes.length) throw Error("No hay notas en esas pistas y compases.");
  notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const held = new Map();
  for (const n of notes) {
    const previous = held.get(n.pitch);
    if (previous && previous.start + previous.duration > n.start + 1e-6)
      throw Error(
        "Las pistas elegidas duplican notas simultáneas. Elegí solo las pistas de piano.",
      );
    held.set(n.pitch, n);
  }
  return {
    title: String(title).slice(0, 100),
    description: `Guía de ${parsed.format === "musicxml" ? "MusicXML, con duraciones escritas" : "MIDI, cuantizado"} · compases ${from}–${to}. Tempo fijo de negra. Revisá la asignación de manos con tu partitura.`,
    timeSignature: parsed.timeSignature || `${meter}/4`,
    meter,
    bars: to - from + 1,
    notes,
  };
}
