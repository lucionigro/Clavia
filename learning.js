import { nextPathLesson } from "./learning-path.js";
import { studyDomains } from "./advanced-curriculum.js";
export { studyDomains };
const legacyDomains = {
  postura: "technique",
  mapa: "reading",
  pulso: "reading",
  cinco: "technique",
  izquierda: "technique",
  figuras: "reading",
  "primera-melodia": "reading",
  semitonos: "harmony",
  sol: "reading",
  fa: "reading",
  "escala-do": "technique",
  intervalos: "ear",
  triadas: "harmony",
  manos: "technique",
  corcheas: "reading",
  "estudio-inicial": "classical",
  tonalidades: "harmony",
  menores: "technique",
  inversiones: "harmony",
  funciones: "harmony",
  arpegios: "technique",
  expresion: "classical",
  sincopa: "reading",
  pentatonica: "improvisation",
  septimas: "harmony",
  "tecnica-avanzada": "technique",
  "ii-v-i": "harmony",
  modos: "improvisation",
  extensiones: "harmony",
  dominantes: "harmony",
  blues: "improvisation",
  polirritmia: "reading",
  analisis: "study",
  proyecto: "study",
};
export const lessonDomain = (lesson) =>
  lesson.domain || legacyDomains[lesson.id] || "study";
export function validateLearning(value, state) {
  for (const [id, r] of Object.entries(value.reviews || {}).slice(0, 300)) {
    if (!/^[a-z0-9-]{1,100}$/.test(id) || !r || !Array.isArray(r.takes))
      continue;
    state.reviews[id] = {
      last: Number.isFinite(r.last) ? r.last : 0,
      due: Number.isFinite(r.due) ? r.due : 0,
      takes: r.takes
        .slice(-20)
        .filter((t) => t && Number.isFinite(t.at) && Number.isFinite(t.score))
        .map((t) => ({
          at: t.at,
          score: Math.max(0, Math.min(100, t.score)),
          bpm: Math.max(30, Math.min(140, Number(t.bpm) || 50)),
          qualified: t.qualified === true,
          mode: t.mode === "timed" ? "timed" : "step",
          aid: ["full", "names", "score"].includes(t.aid) ? t.aid : "full",
        })),
    };
  }
  state.journal = Array.isArray(value.journal)
    ? value.journal
        .slice(-80)
        .filter((j) => j && Number.isFinite(j.at) && typeof j.text === "string")
        .map((j) => ({ at: j.at, text: j.text.slice(0, 1000) }))
    : [];
  state.improvisation = Array.isArray(value.improvisation)
    ? value.improvisation
        .slice(-40)
        .filter((r) => r && Number.isFinite(r.date) && Number.isFinite(r.notes))
        .map((r) => ({
          date: r.date,
          notes: Math.max(0, Math.min(10000, r.notes)),
          unique: Math.max(0, Math.min(88, Number(r.unique) || 0)),
          rests: Math.max(0, Math.min(100, Number(r.rests) || 0)),
          bars: Math.max(1, Math.min(128, Number(r.bars) || 8)),
          bpm: Math.max(30, Math.min(140, Number(r.bpm) || 60)),
        }))
    : [];
}
export function recordLessonAttempt(state, id, result, now = Date.now()) {
  const review = state.reviews[id] || { last: 0, due: 0, takes: [] };
  const qualified =
    result.full &&
    result.mode === "timed" &&
    result.pitchAccuracy >= 95 &&
    result.durationAccuracy >= 90 &&
    result.attackAccuracy >= 90 &&
    result.aid === "score";
  review.last = now;
  review.takes = [
    ...review.takes,
    {
      at: now,
      score: result.score,
      bpm: result.bpm,
      qualified,
      mode: result.mode,
      aid: result.aid,
    },
  ].slice(-20);
  const successes = review.takes.filter((t) => t.qualified).length;
  review.due =
    now +
    (qualified ? Math.min(14, 2 ** Math.min(successes, 4)) : 1) * 86400000;
  state.reviews[id] = review;
}
export function evidenceStatus(state, id) {
  const takes = state.reviews[id]?.takes || [],
    qualified = takes.filter((t) => t.qualified),
    days = new Set(
      qualified.map((t) => new Date(t.at).toLocaleDateString("en-CA")),
    );
  if (state.completed.includes(id) && qualified.length >= 3 && days.size >= 2)
    return { label: "Ejercicio afianzado", kind: "mastered" };
  if (takes.length || state.completed.includes(id))
    return { label: "En práctica", kind: "practiced" };
  return { label: "Por descubrir", kind: "new" };
}
export function buildDailyPlan(state, lessons, now = Date.now()) {
  const focus = state.profile?.focus || "general";
  const due = lessons
    .filter(
      (l) => state.completed.includes(l.id) && state.reviews[l.id]?.due <= now,
    )
    .sort((a, b) => state.reviews[a.id].due - state.reviews[b.id].due)[0];
  const next = nextPathLesson(state, lessons);
  const beginner = next?.level === 0;
  const total = state.goal || 15,
    technical = Math.max(2, Math.round(total * 0.2)),
    study = Math.max(4, Math.round(total * 0.4)),
    music = Math.max(2, Math.round(total * 0.25)),
    creative = Math.max(1, total - technical - study - music);
  if (beginner)
    return [
      {
        id: "learn",
        title: "Seguí el recorrido, paso a paso",
        detail: next.title,
        minutes: total,
        lesson: next.id,
      },
    ];
  return [
    {
      id: "warmup",
      title: due
        ? "Volvé a una idea que ya tocaste"
        : "Prepará tu próxima lección",
      detail: due?.title || next?.title || "Volvé a una lección conocida",
      minutes: technical,
      lesson: due?.id || next?.id,
    },
    {
      id: "learn",
      title: "Seguí el recorrido, paso a paso",
      detail: next?.title || "Volvé a tu ejercicio menos estable",
      minutes: study,
      lesson: next?.id,
    },
    {
      id: "music",
      title: "Llevá la idea a una pieza",
      detail:
        focus === "classical"
          ? "Leé una pieza y buscá su frase principal"
          : "Trabajá dos compases de tu repertorio",
      minutes: music,
      page: "library",
    },
    {
      id: "create",
      title: "Cerrá con algo tuyo",
      detail: "Una pregunta, una respuesta y un silencio",
      minutes: creative,
      tool: "improv",
    },
  ];
}
export function domainProgress(state, lessons, domain) {
  const list = lessons.filter((l) => lessonDomain(l) === domain);
  return {
    total: list.length,
    completed: list.filter((l) => state.completed.includes(l.id)).length,
    practiced: list.filter((l) => evidenceStatus(state, l.id).kind !== "new")
      .length,
    mastered: list.filter(
      (l) => evidenceStatus(state, l.id).kind === "mastered",
    ).length,
  };
}
