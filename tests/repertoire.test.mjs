import test from "node:test";
import assert from "node:assert/strict";
import { pieces, songCatalog, searchRepertoire } from "../repertoire.js";
import { parseMIDI, scoreFromMIDI } from "../midi-file.js";
import { validateImportedPiece } from "../library-store.js";
import { notationParts, scoreSVG } from "../guided-ui.js";
import { PracticeSession, selectPassage } from "../guided-score.js";
import { defaultState, validateState } from "../progress.js";
import policy from "../desktop/policy.cjs";
function play(score, mode) {
  const session = new PracticeSession(score, { bpm: 60, mode });
  const events = score.notes
    .flatMap((n) => [
      { at: n.start * 1000, on: true, n },
      { at: (n.start + n.duration) * 1000, on: false, n },
    ])
    .sort((a, b) => a.at - b.at || Number(a.on) - Number(b.on));
  for (const e of events) {
    session.tick(e.at);
    e.on ? session.on(e.n.pitch, e.at) : session.off(e.n.pitch, e.at);
  }
  return session.summary();
}
test("Las 15 piezas tienen acompañamiento real y se pueden aprobar con MIDI correcto en ambos modos", () => {
  assert.equal(pieces.length, 15);
  for (const p of pieces) {
    assert.deepEqual([...new Set(p.score.notes.map((n) => n.hand))].sort(), [
      "left",
      "right",
    ]);
    assert.equal(
      new Set(p.score.notes.map((n) => n.id)).size,
      p.score.notes.length,
    );
    for (const n of p.score.notes) {
      assert.ok(n.pitch >= 36 && n.pitch <= 96);
      assert.ok(n.start + n.duration <= p.score.bars * p.score.meter);
    }
    for (const mode of ["step", "timed"]) {
      const r = play(p.score, mode);
      assert.equal(
        r.passed,
        true,
        `${p.title} ${mode}: ${JSON.stringify(r.errors)}`,
      );
      assert.equal(r.score, 100);
    }
  }
});
test("El catálogo distingue canciones comerciales de arreglos incluidos y busca con acentos", () => {
  assert.equal(songCatalog.length, 24);
  assert.ok(songCatalog.every((p) => p.licensed && !p.score));
  assert.equal(searchRepertoire(songCatalog, { query: "garcia" }).length, 5);
  assert.equal(
    searchRepertoire(songCatalog, { artist: "The Beatles" }).length,
    4,
  );
  assert.equal(
    searchRepertoire(pieces, { favorites: true, favoriteIds: ["azul"] })[0]
      .title,
    "Paseo en azul",
  );
});
const vlq = (n) => {
  const a = [n & 127];
  while ((n >>= 7)) a.unshift((n & 127) | 128);
  return a;
};
export function midiFixture({ meter = 4, tempo = false } = {}) {
  const data = [
    0,
    255,
    88,
    4,
    meter,
    2,
    24,
    8,
    0,
    255,
    81,
    3,
    7,
    161,
    32,
    0,
    144,
    48,
    90,
    0,
    144,
    60,
    90,
    ...vlq(480),
    128,
    60,
    0,
    0,
    144,
    62,
    90,
    ...vlq(480),
    62,
    0,
    ...vlq(960),
    128,
    48,
    0,
    ...(tempo ? [0, 255, 81, 3, 9, 39, 192] : []),
    0,
    255,
    47,
    0,
  ];
  const len = data.length;
  return Uint8Array.from([
    77,
    84,
    104,
    100,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    1,
    1,
    224,
    77,
    84,
    114,
    107,
    (len >>> 24) & 255,
    (len >>> 16) & 255,
    (len >>> 8) & 255,
    len & 255,
    ...data,
  ]).buffer;
}
test("MIDI tipo 0, running status, tempo y manos divididas conservan ataques y duraciones", () => {
  const parsed = parseMIDI(midiFixture());
  assert.equal(parsed.bpm, 120);
  assert.equal(parsed.meter, 4);
  assert.equal(parsed.tracks[0].notes.length, 3);
  const s = scoreFromMIDI(parsed, { 0: "split" }, { title: "Prueba", to: 1 });
  assert.equal(s.notes.find((n) => n.pitch === 48).duration, 4);
  assert.equal(s.notes.find((n) => n.pitch === 62).start, 1);
  assert.equal(s.notes.find((n) => n.pitch === 48).hand, "left");
  assert.equal(play(s, "timed").passed, true);
});
test("MIDI inválido, compás no compatible, notas duplicadas y pasajes fuera de rango dan errores útiles", () => {
  assert.throws(
    () => parseMIDI(new Uint8Array([1, 2, 3]).buffer),
    /incompleto/,
  );
  const b = midiFixture();
  assert.throws(() => parseMIDI(b.slice(0, -5)), /incompleto/);
  assert.throws(() => parseMIDI(midiFixture({ meter: 5 })), /compases/);
  const p = parseMIDI(midiFixture());
  assert.throws(
    () => scoreFromMIDI(p, { 0: "split" }, { to: 129 }),
    /128 compases/,
  );
  assert.throws(
    () => scoreFromMIDI(p, { 0: "skip" }, { to: 1 }),
    /No hay notas/,
  );
  p.tracks[0].notes[0].pitch = 10;
  assert.throws(() => scoreFromMIDI(p, { 0: "split" }, { to: 1 }), /rango/);
});
test("Un MIDI con cambios de tempo se advierte y 3/4 usa tres pulsos por compás", () => {
  assert.equal(parseMIDI(midiFixture({ tempo: true })).tempoChanges, true);
  const parsed = parseMIDI(midiFixture({ meter: 3 }));
  const s = scoreFromMIDI(parsed, { 0: "split" }, { to: 2 });
  assert.equal(s.meter, 3);
  assert.match(scoreSVG(s), /Compás de 3 por cuatro/);
  assert.equal(play(s, "timed").passed, true);
});
test("Las ligaduras dividen la notación sin crear ataques; los pasajes incluyen notas que ya estaban sostenidas", () => {
  const s = {
    title: "Prueba",
    meter: 4,
    bars: 2,
    notes: [{ id: "n", pitch: 60, start: 3, duration: 3, hand: "right" }],
  };
  const parts = notationParts(s);
  assert.deepEqual(
    parts.map((n) => [n.start, n.duration, n.continuation]),
    [
      [3, 1, false],
      [4, 2, true],
    ],
  );
  assert.match(scoreSVG(s), /Ligadura/);
  assert.deepEqual(selectPassage(s, 2, 2).notes[0], {
    id: "n",
    pitch: 60,
    start: 0,
    duration: 2,
    hand: "right",
  });
  const dotted = notationParts({
    meter: 4,
    notes: [{ id: "n", pitch: 60, start: 0, duration: 1.5, hand: "right" }],
  });
  assert.deepEqual(
    dotted.map((n) => n.duration),
    [1.5],
  );
});
test("La copia de un arreglo valida límites y elimina HTML de atributos internos", () => {
  const p = {
    id: "import-test",
    title: "<img onerror=alert(1)>",
    artist: "Yo",
    score: scoreFromMIDI(parseMIDI(midiFixture()), { 0: "split" }, { to: 1 }),
  };
  const valid = validateImportedPiece(p);
  assert.equal(valid.score.notes[0].id, "import-note-0");
  assert.match(scoreSVG(valid.score), /&lt;img/);
  assert.doesNotMatch(scoreSVG(valid.score), /Partitura de <img/);
  assert.throws(
    () =>
      validateImportedPiece({
        ...p,
        score: {
          ...p.score,
          notes: [{ ...p.score.notes[0], duration: Infinity }],
        },
      }),
    /Nota inválida/,
  );
  const duplicate = {
    ...p,
    score: { ...p.score, notes: [p.score.notes[0], p.score.notes[0]] },
  };
  assert.throws(() => validateImportedPiece(duplicate), /superpuestas/);
});
test("Progreso anterior y nuevo: favoritos y resultados sobreviven a una exportación", () => {
  const s = defaultState();
  s.favorites = ["azul", "charly-ojos"];
  s.repertoire.azul = {
    attempts: 2,
    best: 75,
    completed: false,
    mode: "step",
    bpm: 55,
    last: 123,
  };
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))), s);
  const old = { version: 1, completed: [] };
  assert.deepEqual(validateState(old).favorites, []);
});
test("El escritorio solo sirve archivos incluidos y permite enlaces HTTPS conocidos", () => {
  assert.equal(policy.isLocal("clavia://app/index.html"), true);
  assert.equal(policy.isLocal("https://app/"), false);
  assert.equal(policy.isLocal("clavia://evil/"), false);
  assert.equal(policy.isSafeExternal("file:///etc/passwd"), false);
  assert.equal(
    policy.isSafeExternal("https://developer.mozilla.org/en-US/"),
    true,
  );
  assert.equal(
    policy.isSafeExternal("https://developer.mozilla.org.evil.com"),
    false,
  );
  assert.ok(!policy.allowed.includes("/package.json"));
});
