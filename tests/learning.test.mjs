import test from "node:test";
import assert from "node:assert/strict";
import { lessons } from "../curriculum.js";
import {
  studyDomains,
  buildDailyPlan,
  recordLessonAttempt,
  evidenceStatus,
} from "../learning.js";
import { defaultState, validateState } from "../progress.js";
import { PracticeSession, scoreFromExercise } from "../guided-score.js";
import { scoreSVG } from "../guided-ui.js";
import { newAuralSample, compareAural } from "../aural-lab.js";
import {
  analyzeImprovisation,
  exportPerformanceMIDI,
} from "../improvisation.js";
import { parseMIDI } from "../midi-file.js";
import { validateInstrument, rangeMismatch } from "../instrument.js";
test("82 lecciones, ocho dominios y todos los scores tienen una ejecución perfecta posible", () => {
  assert.equal(lessons.length, 82);
  assert.equal(studyDomains.length, 8);
  for (const l of lessons) {
    if (["ear", "rhythm"].includes(l.practice.type)) continue;
    const score = scoreFromExercise(l.practice);
    assert.ok(scoreSVG(score).includes("<svg"), l.id);
    for (const mode of ["step", "timed"]) {
      const s = new PracticeSession(score, { bpm: 60, mode }),
        events = score.notes
          .flatMap((n) => [
            { at: n.start * 1000, on: true, n },
            { at: (n.start + n.duration) * 1000, on: false, n },
          ])
          .sort((a, b) => a.at - b.at || Number(a.on) - Number(b.on));
      for (const e of events) {
        s.tick(e.at);
        e.on ? s.on(e.n.pitch, e.at) : s.off(e.n.pitch, e.at);
      }
      assert.equal(
        s.summary().passed,
        true,
        `${l.id}/${mode}: ${JSON.stringify(s.errors)}`,
      );
    }
  }
});
test("Afianzar exige varias tomas en días distintos y no se concede con ayudas o un pasaje parcial", () => {
  const s = defaultState(),
    id = "postura",
    base = {
      full: true,
      mode: "timed",
      aid: "score",
      score: 100,
      bpm: 60,
      pitchAccuracy: 100,
      durationAccuracy: 100,
      attackAccuracy: 100,
    };
  s.completed = [id];
  recordLessonAttempt(s, id, { ...base, full: false }, 1000);
  recordLessonAttempt(s, id, { ...base, aid: "names" }, 2000);
  assert.equal(evidenceStatus(s, id).kind, "practiced");
  recordLessonAttempt(s, id, base, Date.UTC(2026, 0, 1, 12));
  recordLessonAttempt(s, id, base, Date.UTC(2026, 0, 1, 13));
  assert.equal(evidenceStatus(s, id).kind, "practiced");
  recordLessonAttempt(s, id, base, Date.UTC(2026, 0, 2, 12));
  assert.equal(evidenceStatus(s, id).kind, "mastered");
  assert.ok(s.reviews[id].due > s.reviews[id].last);
});
test("El plan distribuye el tiempo y el foco clásico conserva las bases de un principiante", () => {
  const s = defaultState();
  s.profile.focus = "classical";
  s.completed = lessons
    .filter((l) => l.level === 0)
    .slice(0, 4)
    .map((l) => l.id);
  const plan = buildDailyPlan(s, lessons);
  assert.equal(
    plan.reduce((n, p) => n + p.minutes, 0),
    15,
  );
  assert.equal(lessons.find((l) => l.id === plan[1].lesson).level, 0);
  assert.equal(plan[3].tool, "improv");
});
test("Las copias conservan diario, evidencia y perfil con límites y datos seguros", () => {
  const s = defaultState();
  s.instrument = {
    ...s.instrument,
    keys: 88,
    firstNote: 21,
    model: "Mi piano",
    configured: true,
  };
  s.journal = [{ at: 10, text: "Escuchar el bajo" }];
  s.reviews.postura = {
    last: 1,
    due: 2,
    takes: [
      {
        at: 1,
        score: 100,
        bpm: 60,
        qualified: true,
        mode: "timed",
        aid: "score",
      },
    ],
  };
  const restored = validateState(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored, s);
  assert.equal(
    validateState({ version: 1, completed: [] }).instrument.keys,
    61,
  );
  assert.equal(validateInstrument({ keys: 999, firstNote: 999 }).firstNote, 36);
  assert.equal(
    rangeMismatch(
      { notes: [{ pitch: 21 }, { pitch: 60 }] },
      { keys: 61, firstNote: 36 },
    ),
    1,
  );
});
test("El oído usa material nuevo y compara respuestas sin aceptar notas extra", () => {
  const a = newAuralSample("melody", 3, () => 0),
    b = newAuralSample("melody", 3, () => 0.9);
  assert.notDeepEqual(a, b);
  const response = a.notes.map((n) => ({
    pitch: n.pitch,
    start: 1000 + n.start * 600,
  }));
  assert.equal(compareAural(a, response).pitch, 100);
  assert.ok(
    compareAural(a, [...response, { pitch: 80, start: 4000 }]).pitch < 100,
  );
  const rhythm = newAuralSample("rhythm", 3, () => 0);
  assert.equal(
    compareAural(
      rhythm,
      rhythm.notes.map((n) => ({
        pitch: n.pitch,
        start: 9000 + n.start * 600,
      })),
    ).timing,
    100,
  );
});
test("Una improvisación se describe sin calificar creatividad y su MIDI conserva las notas", () => {
  const notes = [
    { pitch: 60, start: 0, duration: 500, velocity: 0.7 },
    { pitch: 64, start: 600, duration: 500, velocity: 0.5 },
    { pitch: 67, start: 1200, duration: 500, velocity: 0.8 },
  ];
  const a = analyzeImprovisation(notes, { bars: 8, bpm: 60, durationMs: 2000 });
  assert.equal(a.notes, 3);
  assert.equal(a.unique, 3);
  assert.equal(a.rests, 25);
  assert.equal(a.score, undefined);
  const bytes = exportPerformanceMIDI(notes, 60),
    parsed = parseMIDI(bytes.buffer);
  assert.equal(parsed.tracks[0].notes.length, 3);
  assert.equal(parsed.bpm, 60);
});
