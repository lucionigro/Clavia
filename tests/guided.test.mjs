import test from "node:test";
import assert from "node:assert/strict";
import {
  PracticeSession,
  guidedStudies,
  scoreFromExercise,
  selectPassage,
  validateGuided,
} from "../guided-score.js";
import { scoreSVG } from "../guided-ui.js";
import { defaultState, validateState } from "../progress.js";
const melody = () => scoreFromExercise({ notes: [60, 62], type: "sequence" });

test("No se aprueba por pulsar y soltar sin sostener la nota; un reintento correcto sí sirve", () => {
  const s = new PracticeSession(melody(), { bpm: 60, mode: "step" });
  s.on(60, 0);
  s.off(60, 100);
  assert.equal(s.results.get("note-0").state, "pending");
  assert.equal(s.errors[0].type, "short");
  assert.equal(s.group, 0);
  s.on(60, 200);
  s.off(60, 1200);
  s.on(62, 1250);
  s.off(62, 2250);
  assert.equal(s.done, true);
  assert.equal(s.summary().passed, true);
  assert.equal(s.summary().score, 67);
});
test("El modo libre de tempo acepta una entrada tardía, pero distingue nota y octava equivocadas", () => {
  const s = new PracticeSession(melody());
  s.on(72, 5000);
  s.on(65, 5500);
  assert.deepEqual(
    s.errors.map((e) => e.type),
    ["octave", "pitch"],
  );
  s.on(60, 9000);
  s.off(60, 10000);
  assert.equal(s.results.get("note-0").state, "correct");
});
test("El modo con pulso exige ataques dentro de tolerancia y marca las notas omitidas", () => {
  const s = new PracticeSession(melody(), { bpm: 60, mode: "timed" });
  s.on(60, 100);
  s.off(60, 1100);
  s.tick(1400);
  assert.equal(s.results.get("note-0").state, "correct");
  assert.equal(s.results.get("note-1").state, "missed");
  assert.equal(s.summary().passed, false);
});
test("Una duración excesiva se distingue de una liberación temprana", () => {
  const s = new PracticeSession(melody(), { bpm: 60, mode: "timed" });
  s.on(60, 0);
  s.off(60, 1500);
  assert.equal(s.errors[0].type, "long");
  assert.equal(s.results.get("note-0").state, "incorrect");
});
test("Los acordes requieren superposición, no acumular clics independientes", () => {
  const score = scoreFromExercise({ type: "chord", notes: [60, 64, 67] });
  const s = new PracticeSession(score, { bpm: 60 });
  s.on(60, 0);
  s.off(60, 4000);
  assert.equal(s.errors[0].type, "together");
  assert.equal(s.summary().passed, false);
  s.on(60, 5000);
  s.on(64, 5050);
  s.on(67, 5100);
  s.off(60, 9000);
  s.off(64, 9050);
  s.off(67, 9100);
  assert.equal(s.summary().passed, true);
});
test("Se puede sostener un bajo mientras la melodía avanza a nuevas notas", () => {
  const study = selectPassage(guidedStudies[2], 1, 1);
  const s = new PracticeSession(study, { bpm: 60 });
  s.on(48, 0);
  s.on(60, 0);
  s.off(60, 1000);
  s.tick(1000);
  assert.equal(s.group, 1);
  assert.equal(s.held.has(48), true);
  s.on(62, 1000);
  s.off(62, 2000);
  s.on(64, 2000);
  s.off(64, 3000);
  s.on(67, 3000);
  s.off(67, 4000);
  s.off(48, 4000);
  assert.equal(s.summary().passed, true);
});
test("Después de soltar un bajo antes de tiempo, se puede corregir sin bloquear el ejercicio", () => {
  const s = new PracticeSession(selectPassage(guidedStudies[2], 1, 1), {
    bpm: 60,
  });
  s.on(48, 0);
  s.on(60, 0);
  s.off(60, 1000);
  s.tick(1000);
  s.off(48, 1100);
  assert.equal(s.group, 0);
  s.on(48, 1200);
  s.off(48, 5200);
  s.on(62, 5300);
  s.off(62, 6300);
  s.on(64, 6300);
  s.off(64, 7300);
  s.on(67, 7300);
  s.off(67, 8300);
  assert.equal(s.summary().passed, true);
});
test("La repetición de un compás recorta y normaliza notas y mano", () => {
  const score = selectPassage(guidedStudies[2], 2, 2, "left");
  assert.equal(score.bars, 1);
  assert.equal(score.sourceBar, 2);
  assert.equal(score.notes.length, 1);
  assert.equal(score.notes[0].start, 0);
  assert.equal(score.notes[0].pitch, 53);
});
test("Las preferencias nuevas sobreviven exportación e importación y las copias anteriores siguen siendo válidas", () => {
  const old = { version: 1, completed: [] };
  assert.equal(validateState(old).guided.keyboard, 61);
  const state = defaultState();
  state.guided = {
    bpm: 40,
    aid: "score",
    mode: "timed",
    hand: "left",
    keyboard: 61,
    firstNote: 36,
    loop: true,
  };
  assert.deepEqual(
    validateState(JSON.parse(JSON.stringify(state))).guided,
    state.guided,
  );
  assert.equal(validateGuided({ bpm: 999, aid: "<script>" }).bpm, 140);
  assert.equal(validateGuided(null).aid, "full");
});
test("La partitura incluye dos claves, valores de duración, silencios y digitaciones reales", () => {
  const dual = scoreSVG(guidedStudies[2]);
  assert.match(dual, /IZQUIERDA/);
  assert.match(dual, /DERECHA/);
  assert.match(dual, /𝄢/);
  assert.match(dual, /𝄞/);
  assert.match(dual, /dedo 5/);
  const rhythm = scoreSVG(guidedStudies[1]);
  assert.match(rhythm, /Silencio de 2 negras/);
  assert.match(rhythm, /corchea/);
  assert.match(rhythm, /redonda/);
  assert.doesNotMatch(
    scoreSVG(guidedStudies[0], "score"),
    /class="score-finger"/,
  );
});
test("Todos los estudios tienen alturas en el Casio de 61 teclas y figuras dentro del compás", () => {
  for (const score of guidedStudies)
    for (const n of score.notes) {
      assert.ok(n.pitch >= 36 && n.pitch <= 96);
      assert.ok(n.start >= 0 && n.start + n.duration <= score.bars * 4);
      assert.ok((n.start % 4) + n.duration <= 4);
    }
});

test("Cerrar el atril cancela animaciones pendientes y evita que actualicen el siguiente ejercicio", async () => {
  const { GuidedPractice } = await import("../guided-ui.js");
  const original = {
    document: globalThis.document,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    cancelAnimationFrame: globalThis.cancelAnimationFrame,
  };
  const pending = new Map();
  let updates = 0,
    releases = 0,
    sequence = 0;
  globalThis.document = { body: { classList: { toggle() {} } } };
  globalThis.requestAnimationFrame = (fn) => {
    pending.set(++sequence, fn);
    return sequence;
  };
  globalThis.cancelAnimationFrame = (id) => pending.delete(id);
  try {
    const instance = Object.create(GuidedPractice.prototype);
    Object.assign(instance, {
      root: {
        querySelector: () => ({ textContent: "" }),
        classList: { toggle() {}, remove() {} },
      },
      prefs: { mode: "preview" },
      options: {
        silenceGuides() {},
        releaseInput() {
          releases++;
        },
      },
      sounding: new Set(),
      disposed: false,
      updateVisuals() {
        updates++;
      },
    });
    instance.setFocus(true);
    const queued = [...pending.values()][0];
    assert.equal(pending.size, 1);
    instance.dispose();
    assert.equal(pending.size, 0);
    assert.equal(releases, 1);
    queued();
    assert.equal(updates, 0);
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
