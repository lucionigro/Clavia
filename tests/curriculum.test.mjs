import test from "node:test";
import assert from "node:assert/strict";
import { lessons, levels, pieces } from "../curriculum.js";
import { defaultState, validateState } from "../progress.js";

test("El recorrido contiene 82 lecciones únicas, cuatro niveles y retos reales", () => {
  assert.equal(lessons.length, 82);
  assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length);
  assert.equal(levels.length, 4);
  for (let i = 0; i < 4; i++)
    assert.ok(lessons.filter((l) => l.level === i).length >= 8);
  for (const l of lessons) {
    assert.ok(l.title && l.subtitle && l.challenge.trim().length > 0, l.id);
    assert.ok(
      l.steps.length >= 3 &&
        l.steps.every(([title, text]) => title && text.trim().length > 0),
      l.id,
    );
    assert.ok(l.answer >= 0 && l.answer < l.options.length, l.id);
    assert.equal(new Set(l.options).size, l.options.length, l.id);
    assert.ok(
      ["sequence", "chord", "rhythm", "ear", "reading"].includes(
        l.practice.type,
      ),
      l.id,
    );
  }
});

test("Notas de ejercicios y repertorio entran en un teclado de 61 teclas habitual", () => {
  for (const item of [...lessons.map((l) => l.practice), ...pieces]) {
    for (const n of item.notes || [])
      assert.ok(Number.isInteger(n) && n >= 36 && n <= 96, String(n));
    if (item.type === "reading")
      for (const n of item.notes)
        assert.ok([0, 2, 4, 5, 7, 9, 11].includes(n % 12));
  }
  assert.deepEqual(
    lessons.find((l) => l.id === "triadas").practice.notes,
    [60, 64, 67],
  );
  assert.deepEqual(
    lessons.find((l) => l.id === "septimas").practice.notes,
    [60, 64, 67, 71],
  );
  assert.deepEqual(
    lessons.find((l) => l.id === "menores").practice.notes,
    [57, 59, 60, 62, 64, 65, 68, 69],
  );
});

test("Una copia de progreso válida conserva los datos y elimina identificadores ajenos", () => {
  const input = {
    ...defaultState(),
    completed: ["postura", "postura", "no-existe"],
    seconds: 300,
    goal: 20,
    days: { "2026-10-17": 120 },
    scores: { postura: 83 },
    practiceChecks: { postura: true },
  };
  const output = validateState(input);
  assert.deepEqual(output.completed, ["postura"]);
  assert.equal(output.seconds, 300);
  assert.equal(output.scores.postura, 83);
  assert.equal(output.goal, 20);
  assert.equal(output.days["2026-10-17"], 120);
  assert.equal(output.practiceChecks.postura, true);
});

test("La importación limita valores numéricos, fechas y contenido no esperado", () => {
  const output = validateState({
    ...defaultState(),
    seconds: -50,
    volume: 50,
    goal: 999,
    days: { "no-es-fecha": 30, "2026-10-17": 999999 },
    scores: { postura: 150, "<script>": 100 },
    completed: ["<img>", null, 9],
  });
  assert.equal(output.seconds, 0);
  assert.equal(output.volume, 1);
  assert.equal(output.goal, 15);
  assert.deepEqual(output.completed, []);
  assert.deepEqual(output.days, { "2026-10-17": 86400 });
  assert.deepEqual(output.scores, { postura: 100 });
  for (const value of [
    null,
    {},
    [],
    { version: 2, completed: [] },
    { version: 1, completed: "postura" },
  ])
    assert.throws(() => validateState(value));
});

test("Las sesiones empiezan con objetos independientes", () => {
  const a = defaultState(),
    b = defaultState();
  a.completed.push("postura");
  a.days["2026-10-17"] = 10;
  assert.deepEqual(b.completed, []);
  assert.deepEqual(b.days, {});
});

import { spellNotes, scoreRhythm } from "../music.js";

test("La escritura de escalas y acordes respeta bemoles y sostenidos de su tonalidad", () => {
  assert.deepEqual(spellNotes(60, [0, 3, 7, 10], [0, 2, 4, 6]), [
    "Do4",
    "Mi♭4",
    "Sol4",
    "Si♭4",
  ]);
  assert.deepEqual(
    spellNotes(71, [0, 2, 4, 5, 7, 9, 11, 12], [0, 1, 2, 3, 4, 5, 6, 7]),
    ["Si4", "Do♯5", "Re♯5", "Mi5", "Fa♯5", "Sol♯5", "La♯5", "Si5"],
  );
  assert.deepEqual(
    spellNotes(61, [0, 2, 4, 5, 7, 9, 11, 12], [0, 1, 2, 3, 4, 5, 6, 7]),
    ["Re♭4", "Mi♭4", "Fa4", "Sol♭4", "La♭4", "Si♭4", "Do5", "Re♭5"],
  );
});

test("El ritmo verifica fase, tempo, cantidad de ataques y umbral de aprobación", () => {
  const ideal = Array.from({ length: 8 }, (_, i) => 4000 + i * 1000);
  assert.deepEqual(scoreRhythm(ideal, 4000, 1000), {
    error: 0,
    score: 100,
    passed: true,
  });
  assert.equal(
    scoreRhythm(
      ideal.map((t) => t + 200),
      4000,
      1000,
    ).score,
    80,
  );
  assert.equal(
    scoreRhythm(
      ideal.map((t) => t + 500),
      4000,
      1000,
    ).passed,
    false,
  );
  assert.equal(
    scoreRhythm(
      ideal.map((t, i) => t + i * 150),
      4000,
      1000,
    ).passed,
    false,
  );
  assert.equal(scoreRhythm(ideal.slice(1), 4000, 1000).passed, false);
  assert.equal(scoreRhythm(ideal, 4000, 0).passed, false);
});
