/** @typedef {{id:string,pitch:number,start:number,duration:number,hand:'right'|'left',label?:string,finger?:number}} ScoreNote */
/** @typedef {{title:string,notes:ScoreNote[],bars:number,meter:number,description:string}} Score */
const names = [
  "Do",
  "Do♯",
  "Re",
  "Mi♭",
  "Mi",
  "Fa",
  "Fa♯",
  "Sol",
  "La♭",
  "La",
  "Si♭",
  "Si",
];
export const pitchName = (n) => names[n % 12] + (Math.floor(n / 12) - 1);
export const durationName = (d) =>
  ({
    0.125: "fusa · ⅛ de negra",
    0.25: "semicorchea · ¼ de negra",
    0.5: "corchea · ½ pulso",
    0.75: "corchea con puntillo · ¾ de negra",
    1.5: "negra con puntillo · 1½ negras",
    3: "blanca con puntillo · 3 negras",
    1: "negra · 1 pulso",
    2: "blanca · 2 pulsos",
    4: "redonda · 4 pulsos",
  })[d] || `${Number(d.toFixed(3))} negras`;
const line = (items, hand = "right") => {
  let start = 0;
  return items.flatMap((item, i) => {
    const [pitch, duration = 1, finger] = Array.isArray(item)
      ? item
      : [item, 1];
    const note =
      pitch === null
        ? []
        : [{ id: `${hand}-${i}`, pitch, start, duration, hand, finger }];
    start += duration;
    return note;
  });
};
export const guidedStudies = [
  {
    id: "first-notes",
    title: "Mis primeras notas",
    description:
      "Derecha sobre Do–Re–Mi–Fa–Sol. Una negra por pulso y un Do final de cuatro pulsos.",
    bars: 3,
    meter: 4,
    notes: line([
      [60, 1, 1],
      [62, 1, 2],
      [64, 1, 3],
      [65, 1, 4],
      [67, 1, 5],
      [65, 1, 4],
      [64, 1, 3],
      [62, 1, 2],
      [60, 4, 1],
    ]),
  },
  {
    id: "durations",
    title: "Sonidos que duran, silencios que cuentan",
    description:
      "Negras, corcheas, blancas y redonda. En el primer compás, seguí contando durante los dos pulsos de silencio.",
    bars: 3,
    meter: 4,
    notes: line([
      [60, 1, 1],
      [62, 1, 2],
      [null, 2],
      [64, 0.5, 3],
      [65, 0.5, 4],
      [67, 1, 5],
      [64, 2, 3],
      [60, 4, 1],
    ]),
  },
  {
    id: "two-hands",
    title: "Mi primer diálogo a dos manos",
    description:
      "Azul: izquierda, un bajo de cuatro pulsos. Verde: derecha, una nota por pulso. Primero podés practicar cada mano por separado.",
    bars: 4,
    meter: 4,
    notes: [
      ...line(
        [
          [48, 4, 5],
          [53, 4, 2],
          [55, 4, 1],
          [48, 4, 5],
        ],
        "left",
      ),
      ...line([
        [60, 1, 1],
        [62, 1, 2],
        [64, 1, 3],
        [67, 1, 5],
        [65, 1, 4],
        [64, 1, 3],
        [62, 1, 2],
        [60, 1, 1],
        [62, 1, 2],
        [64, 1, 3],
        [65, 1, 4],
        [67, 1, 5],
        [64, 1, 3],
        [62, 1, 2],
        [60, 2, 1],
      ]),
    ],
  },
  {
    id: "chords",
    title: "Acordes sin apuro",
    description:
      "Sostené todas las notas de cada acorde juntas durante cuatro pulsos. Usá MIDI, varias teclas de computadora o una pantalla multitáctil.",
    bars: 4,
    meter: 4,
    notes: [
      [60, 64, 67],
      [60, 65, 69],
      [59, 62, 67],
      [60, 64, 67],
    ].flatMap((pitches, b) =>
      pitches.map((pitch, i) => ({
        id: `chord-${b}-${i}`,
        pitch,
        start: b * 4,
        duration: 4,
        hand: "right",
        finger: [1, 3, 5][i],
      })),
    ),
  },
];
/** Adapta ejercicios anteriores sin inventar una partitura de una obra comercial. */
export function scoreFromExercise(config) {
  if (config.score) return config.score;
  const notes = config.notes || [60];
  const hand =
    config.clef === "bass" || Math.max(...notes) < 60 ? "left" : "right";
  const fingerSets = {
    postura: [1, 2, 3, 4, 5],
    cinco: [1, 2, 3, 4, 5, 4, 3, 2, 1],
    izquierda: [5, 4, 3, 2, 1, 2, 3, 4, 5],
    "escala-do": [1, 2, 3, 1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 2, 1],
  };
  const fingers = fingerSets[config.lessonId];
  const chord = config.type === "chord";
  return {
    title: config.title || "Tu ejercicio, paso a paso",
    description: chord
      ? "Versión guiada: sostené el acorde durante cuatro pulsos."
      : "Versión guiada en 4/4: una negra por nota. Los espacios al final del compás son silencios.",
    meter: 4,
    bars: chord ? 1 : Math.ceil(notes.length / 4),
    notes: notes.map((pitch, i) => ({
      id: `note-${i}`,
      pitch,
      start: chord ? 0 : i,
      duration: chord ? 4 : 1,
      hand,
      label: config.noteLabels?.[i],
      finger: fingers?.[i],
    })),
  };
}
export function selectPassage(score, from = 1, to = score.bars, hand = "both") {
  const start = (from - 1) * score.meter,
    end = to * score.meter;
  const notes = score.notes
    .filter(
      (n) =>
        n.start + n.duration > start &&
        n.start < end &&
        (hand === "both" || n.hand === hand),
    )
    .map((n) => ({
      ...n,
      start: Math.max(n.start, start) - start,
      duration: Math.min(n.start + n.duration, end) - Math.max(n.start, start),
    }));
  return { ...score, notes, bars: to - from + 1, sourceBar: from };
}
/** Une pulsaciones de varias fuentes sin confundir dos noteOn de una misma tecla. */
export class PracticeSession {
  constructor(score, { bpm = 60, mode = "step", latency = 0 } = {}) {
    this.score = score;
    this.bpm = bpm;
    this.mode = mode;
    this.latency = latency;
    this.period = 60000 / bpm;
    this.window = Math.min(350, Math.max(120, this.period * 0.3));
    this.results = new Map(
      score.notes.map((n) => [n.id, { state: "pending" }]),
    );
    this.held = new Map();
    this.errors = [];
    this.groupIndex = 0;
    this.overlapGroups = new Set();
    this.feedback =
      "Tocá la nota marcada y sostenela hasta completar su duración.";
    this.groups = [...new Set(score.notes.map((n) => n.start))].sort(
      (a, b) => a - b,
    );
  }
  releaseTolerance(expected) {
    return Math.min(
      expected * 0.35,
      Math.max(30, Math.min(250, expected * 0.2)),
    );
  }
  windowFor(note) {
    const i = this.groups.indexOf(note.start),
      before = i > 0 ? note.start - this.groups[i - 1] : Infinity,
      after =
        i + 1 < this.groups.length ? this.groups[i + 1] - note.start : Infinity;
    return Math.max(
      15,
      Math.min(
        this.window,
        Math.min(before, after, note.duration) * this.period * 0.4,
      ),
    );
  }
  get group() {
    return this.groups[this.groupIndex] ?? this.score.bars * this.score.meter;
  }
  get current() {
    return this.score.notes.filter(
      (n) =>
        n.start === this.group && this.results.get(n.id).state !== "correct",
    );
  }
  get done() {
    return this.mode === "step"
      ? [...this.results.values()].every((r) => r.state === "correct")
      : [...this.results.values()].every((r) =>
          ["correct", "incorrect", "missed"].includes(r.state),
        );
  }
  error(type, n, actual, extra = {}) {
    const e = {
      type,
      id: n?.id,
      expected: n?.pitch,
      actual,
      beat: n?.start ?? this.group,
      ...extra,
    };
    this.errors.push(e);
    return e;
  }
  on(pitch, time) {
    const t = time - this.latency;
    if (this.held.has(pitch)) return;
    const candidates =
      this.mode === "step"
        ? this.current
        : this.score.notes.filter(
            (n) =>
              this.results.get(n.id).state === "pending" &&
              Math.abs(t - n.start * this.period) <= this.windowFor(n),
          );
    const note = candidates.find((n) => n.pitch === pitch);
    if (!note) {
      const expected =
        candidates.find((n) => n.pitch % 12 === pitch % 12) || candidates[0];
      const type =
        expected && expected.pitch % 12 === pitch % 12 ? "octave" : "pitch";
      this.error(type, expected, pitch);
      this.feedback = expected
        ? `Sonó ${pitchName(pitch)}; buscá ${pitchName(expected.pitch)}${type === "octave" ? " en la octava indicada" : ""}.`
        : `${pitchName(pitch)} entró fuera de la ventana de tiempo o durante un silencio.`;
      return;
    }
    this.held.set(pitch, { note, time: t });
    this.results.set(note.id, { state: "held", on: t });
    if (this.mode === "step") {
      const group = this.score.notes.filter((n) => n.start === note.start);
      if (group.every((n) => this.held.has(n.pitch)))
        this.overlapGroups.add(note.start);
    }
    this.feedback = `Bien: ${pitchName(pitch)}. Sostené ${note.duration} ${note.duration === 1 ? "pulso" : "pulsos"} (${((note.duration * this.period) / 1000).toFixed(1)} s).`;
  }
  off(pitch, time) {
    const held = this.held.get(pitch);
    if (!held) return;
    this.held.delete(pitch);
    const { note, time: on } = held,
      actual = time - this.latency - on,
      expected = note.duration * this.period;
    const tolerance = this.releaseTolerance(expected);
    const short = actual < expected - tolerance;
    const long = this.mode === "timed" && actual > expected + tolerance;
    const split =
      this.mode === "step" &&
      !this.overlapGroups.has(note.start) &&
      this.score.notes.filter((n) => n.start === note.start).length > 1;
    if (short || long || split) {
      this.error(split ? "together" : short ? "short" : "long", note, pitch, {
        actualMs: actual,
        expectedMs: expected,
      });
      this.results.set(note.id, {
        state: this.mode === "step" ? "pending" : "incorrect",
        on,
        duration: actual,
      });
      if (this.mode === "step")
        this.groupIndex = Math.min(
          this.groupIndex,
          this.groups.indexOf(note.start),
        );
      this.feedback = split
        ? "Las notas del acorde tienen que sonar juntas. Volvé a sostenerlas al mismo tiempo."
        : `${pitchName(pitch)}: ${short ? "soltaste antes" : "sostuviste de más"}. Duró ${(actual / 1000).toFixed(1)} s; buscábamos ${(expected / 1000).toFixed(1)} s.`;
    } else {
      this.results.set(note.id, {
        state: "correct",
        on,
        duration: actual,
        timing: Math.abs(on - note.start * this.period),
      });
      this.feedback = `${pitchName(pitch)} completa. Buena duración.`;
    }
    if (this.mode === "step") {
      this.advanceStep(time);
      if (this.done)
        this.feedback =
          "¡Pasaje completo! Conectaste lectura, teclas y duración.";
    }
  }

  advanceStep(time) {
    while (this.groupIndex < this.groups.length - 1) {
      const group = this.score.notes.filter((n) => n.start === this.group),
        results = group.map((n) => this.results.get(n.id));
      if (results.some((r) => r.state === "pending")) break;
      if (results.every((r) => r.state === "correct")) {
        this.groupIndex++;
        continue;
      }
      const armed = Math.max(...results.map((r) => r.on));
      if (
        time - armed <
        (this.groups[this.groupIndex + 1] - this.group) * this.period
      )
        break;
      this.groupIndex++;
    }
  }
  stepPosition(time) {
    const group = this.score.notes.filter((n) => n.start === this.group),
      results = group.map((n) => this.results.get(n.id));
    if (!group.length || results.some((r) => r.state === "pending"))
      return this.group;
    const armed = Math.max(...results.map((r) => r.on));
    const next =
      this.groups[this.groupIndex + 1] ??
      this.group + Math.max(...group.map((n) => n.duration));
    return (
      this.group +
      Math.max(0, Math.min(next - this.group, (time - armed) / this.period))
    );
  }
  tick(time) {
    if (this.mode === "step") {
      this.advanceStep(time);
      return;
    }
    if (this.mode !== "timed") return;
    const t = time - this.latency;
    for (const note of this.score.notes) {
      const result = this.results.get(note.id);
      if (
        result.state === "pending" &&
        t > note.start * this.period + this.windowFor(note)
      ) {
        this.results.set(note.id, { state: "missed" });
        this.error("missed", note);
        this.feedback = `Faltó ${pitchName(note.pitch)} en el pulso ${(note.start % this.score.meter) + 1}.`;
      }
      if (
        result.state === "held" &&
        t >
          result.on +
            note.duration * this.period +
            this.releaseTolerance(note.duration * this.period)
      ) {
        this.results.set(note.id, { ...result, state: "incorrect" });
        this.held.delete(note.pitch);
        this.error("long", note, note.pitch);
        this.feedback = `${pitchName(note.pitch)} quedó sostenida demasiado tiempo.`;
      }
    }
  }
  summary() {
    const values = [...this.results.values()],
      correct = values.filter((r) => r.state === "correct").length;
    return {
      correct,
      total: values.length,
      score: Math.round(
        (correct / Math.max(1, values.length + this.errors.length)) * 100,
      ),
      pitchAccuracy: Math.round(
        (values.filter((r) => Number.isFinite(r.on)).length /
          Math.max(
            1,
            values.length +
              this.errors.filter(
                (e) => e.type === "pitch" || e.type === "octave",
              ).length,
          )) *
          100,
      ),
      durationAccuracy: Math.round(
        (correct / Math.max(1, values.length)) * 100,
      ),
      attackAccuracy:
        this.mode === "timed"
          ? Math.round(
              (this.score.notes.filter((n) => {
                const r = this.results.get(n.id);
                return (
                  Number.isFinite(r.on) &&
                  Math.abs(r.on - n.start * this.period) <= this.windowFor(n)
                );
              }).length /
                Math.max(1, values.length)) *
                100,
            )
          : null,
      errors: [...this.errors],
      passed: correct === values.length && values.length > 0,
    };
  }
}

const defaults = {
  bpm: 50,
  aid: "full",
  mode: "preview",
  hand: "both",
  keyboard: 61,
  firstNote: 36,
  loop: false,
};
export const guidedDefaults = () => ({ ...defaults });
export function validateGuided(value = {}) {
  value = value && typeof value === "object" ? value : {};
  return {
    bpm: Number.isFinite(value.bpm)
      ? Math.round(Math.max(30, Math.min(140, value.bpm)) / 5) * 5
      : 50,
    aid: ["full", "names", "score"].includes(value.aid) ? value.aid : "full",
    mode: ["preview", "step", "timed"].includes(value.mode)
      ? value.mode
      : "preview",
    hand: ["both", "right", "left"].includes(value.hand) ? value.hand : "both",
    keyboard: [25, 32, 37, 49, 61, 73, 76, 88].includes(value.keyboard)
      ? value.keyboard
      : 61,
    firstNote:
      Number.isInteger(value.firstNote) &&
      value.firstNote >= 0 &&
      value.firstNote +
        ([25, 32, 37, 49, 61, 73, 76, 88].includes(value.keyboard)
          ? value.keyboard
          : 61) <=
        128
        ? value.firstNote
        : 36,
    loop: value.loop === true,
  };
}
