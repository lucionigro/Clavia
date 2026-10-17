import { validateLearning } from "./learning.js";
import {
  defaultInstrument,
  defaultProfile,
  validateInstrument,
  validateProfile,
} from "./instrument.js";
import { lessons } from "./curriculum.js";
import { guidedDefaults, validateGuided } from "./guided-score.js";
export const defaultState = () => ({
  version: 1,
  instrument: defaultInstrument(),
  profile: defaultProfile(),
  reviews: {},
  journal: [],
  improvisation: [],
  favorites: [],
  repertoire: {},
  guided: guidedDefaults(),
  completed: [],
  seconds: 0,
  days: {},
  scores: {},
  goal: 15,
  labels: true,
  volume: 0.45,
  practiceChecks: {},
});
export function validateState(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.completed))
    throw Error("Formato incorrecto");
  const s = defaultState();
  s.guided = validateGuided(value.guided);
  s.instrument = validateInstrument(value.instrument);
  s.profile = validateProfile(value.profile);
  s.completed = [
    ...new Set(
      value.completed.filter((id) => lessons.some((l) => l.id === id)),
    ),
  ];
  s.seconds = Number.isFinite(value.seconds)
    ? Math.max(0, Math.min(value.seconds, 1e9))
    : 0;
  s.goal = [10, 15, 20, 30, 45].includes(value.goal) ? value.goal : 15;
  s.labels = typeof value.labels === "boolean" ? value.labels : true;
  s.volume = Number.isFinite(value.volume)
    ? Math.max(0, Math.min(1, value.volume))
    : 0.45;
  for (const [day, sec] of Object.entries(value.days || {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(sec) && sec >= 0)
      s.days[day] = Math.min(sec, 86400);
  }
  for (const l of lessons) {
    if (Number.isFinite(value.scores?.[l.id]))
      s.scores[l.id] = Math.max(0, Math.min(100, value.scores[l.id]));
    if (value.practiceChecks?.[l.id] === true) s.practiceChecks[l.id] = true;
  }
  s.favorites = Array.isArray(value.favorites)
    ? [
        ...new Set(
          value.favorites.filter(
            (id) => typeof id === "string" && /^[a-z0-9-]{1,100}$/.test(id),
          ),
        ),
      ].slice(0, 500)
    : [];
  for (const [id, p] of Object.entries(value.repertoire || {}).slice(0, 1000)) {
    if (
      !/^[a-z0-9-]{1,100}$/.test(id) ||
      !p ||
      !Number.isFinite(p.attempts) ||
      !Number.isFinite(p.best)
    )
      continue;
    s.repertoire[id] = {
      attempts: Math.max(0, Math.min(1e6, Math.floor(p.attempts))),
      best: Math.max(0, Math.min(100, p.best)),
      completed: p.completed === true,
      last: Number.isFinite(p.last) ? p.last : 0,
      mode: p.mode === "timed" ? "timed" : "step",
      bpm: Number.isFinite(p.bpm) ? Math.max(30, Math.min(140, p.bpm)) : 60,
    };
  }
  validateLearning(value, s);
  return s;
}
