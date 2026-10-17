import { courseHTML, bindCourse } from "./course-ui.js";
import { ImprovisationLab } from "./improvisation.js";
import { AuralLab } from "./aural-lab.js";
import {
  studyDomains,
  lessonDomain,
  buildDailyPlan,
  recordLessonAttempt,
  evidenceStatus,
  domainProgress,
} from "./learning.js";
import { lessons, levels } from "./curriculum.js";
import { defaultState, validateState } from "./progress.js";
import { spellNotes, scoreRhythm } from "./music.js";
import { GuidedPractice } from "./guided-ui.js";
import { guidedStudies, scoreFromExercise } from "./guided-score.js";
import { libraryHTML, bindLibrary } from "./library-ui.js";
import {
  openSetup,
  instrumentSettingsHTML,
  bindInstrumentSettings,
  updateMIDIMonitor,
  rangeMismatch,
} from "./instrument.js";
import { libraryRequest, validateImportedPiece } from "./library-store.js";
import { escapeHTML as esc } from "./repertoire.js";
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const icons = {
  home: "M3 10 12 3l9 7v10H3Z M9 20v-7h6v7",
  route:
    "M6 4a2 2 0 1 0 0 .1 M18 18a2 2 0 1 0 0 .1 M6 6v5a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3",
  piano: "M3 5h18v15H3Z M8 5v15 M16 5v15 M7 5v7h3V5 M14 5v7h3V5",
  music:
    "M9 18V5l11-2v13 M9 5l11-2 M9 18a3 2 0 1 1-3-2c2 0 3 1 3 2 M20 16a3 2 0 1 1-3-2c2 0 3 1 3 2",
  chart: "M4 20h17 M7 16v-4 M12 16V7 M17 16V3",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2",
  check: "m5 12 4 4L19 6",
  ear: "M8 15c-5-6 0-14 6-11 5 2 5 7 1 10-2 1-1 6-5 6-2 0-3-1-3-3 M10 10c0-4 5-4 5-1 0 2-3 2-3 5",
  flame: "M12 3c2 5 7 6 7 11a7 7 0 0 1-14 0c0-3 2-5 4-7 0 4 3 4 3-4Z",
  book: "M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3Z M12 6v15",
  target:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
};
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name] || icons.music}"/></svg>`;
const noteNames = [
  "Do",
  "Do♯",
  "Re",
  "Re♯",
  "Mi",
  "Fa",
  "Fa♯",
  "Sol",
  "Sol♯",
  "La",
  "Si♭",
  "Si",
];
const noteName = (n, octave = true) =>
  noteNames[n % 12] + (octave ? Math.floor(n / 12) - 1 : "");
const KEY = "clavia-progress-v1";

let state = defaultState(),
  storageOk = true;
try {
  const raw = localStorage.getItem(KEY);
  if (raw) state = validateState(JSON.parse(raw));
} catch {
  storageOk = false;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    storageOk = true;
  } catch {
    if (storageOk)
      toast("No se pudo guardar. Exportá una copia de tu progreso.");
    storageOk = false;
  }
}
const localDay = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
let lastActivity = Date.now();
["pointerdown", "keydown"].forEach((e) =>
  document.addEventListener(e, () => (lastActivity = Date.now()), {
    passive: true,
  }),
);
setInterval(() => {
  if (
    document.visibilityState === "visible" &&
    Date.now() - lastActivity < 60000
  ) {
    state.seconds++;
    const day = localDay();
    state.days[day] = (state.days[day] || 0) + 1;
    if (state.seconds % 15 === 0) save();
    const clock = $(".session-clock");
    if (clock)
      clock.textContent = `${Math.floor((state.days[day] || 0) / 60)} / ${state.goal} min`;
  }
}, 1000);
window.addEventListener("pagehide", save);
let toastTimeout;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").style.display = "block";
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => ($("#toast").style.display = "none"), 4500);
}
const pages = [
  ["home", "Inicio", "home"],
  ["course", "Mi recorrido", "route"],
  ["practice", "Practicar", "piano"],
  ["library", "Repertorio", "music"],
  ["progress", "Mi progreso", "chart"],
];
$("#navigation").innerHTML = pages
  .map(
    ([id, label, i]) =>
      `<button class="nav-item" data-page="${id}">${icon(i)}<span class="nav-text">${label}</span>${id === "course" ? `<span class="nav-count">${lessons.length}</span>` : ""}</button>`,
  )
  .join("");
$("#settings-nav").innerHTML = icon("settings") + "<span>Ajustes</span>";
let page = "home",
  filter = -1,
  practiceTab = "guided",
  exercise = null,
  lesson = null,
  lessonStep = 0,
  quizPassed = false,
  lessonExercisePassed = false,
  metronome = null,
  beat = 0,
  rhythm = null,
  ear = null,
  audioContext,
  midiAccess,
  midiSustain = false;
let guidedPractice = null,
  improvLab = null,
  auralLab = null;
let courseDomain = "all",
  courseQuery = "";
let demoTimers = [],
  voices = new Map(),
  held = new Set();
function audio() {
  if (!audioContext)
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}
function startSound(n, velocity = 0.7, key = `note:${n}`) {
  if (voices.has(key)) stopSound(key);
  const ctx = audio(),
    t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(
    Math.max(0.0001, state.volume * velocity * 0.26),
    t + 0.012,
  );
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, state.volume * velocity * 0.08),
    t + 1.6,
  );
  gain.connect(ctx.destination);
  const oscs = [1, 2, 3].map((partial, i) => {
    const osc = ctx.createOscillator(),
      g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 440 * 2 ** ((n - 69) / 12) * partial;
    g.gain.value = [1, 0.22, 0.08][i];
    osc.connect(g);
    g.connect(gain);
    osc.start();
    return osc;
  });
  voices.set(key, { gain, oscs, n });
  setTimeout(() => {
    if (voices.get(key)?.gain === gain) stopSound(key);
  }, 10000);
}
function stopSound(key) {
  const voice = voices.get(key);
  if (!voice) return;
  const ctx = audioContext,
    t = ctx.currentTime;
  voice.gain.gain.cancelScheduledValues(t);
  voice.gain.gain.setTargetAtTime(0, t, 0.065);
  voice.oscs.forEach((o) => o.stop(t + 0.4));
  setTimeout(() => voice.gain.disconnect(), 450);
  voices.delete(key);
}
function stopAll() {
  voices.forEach((_, key) => stopSound(key));
  held.clear();
  $$(".key.active").forEach((k) => k.classList.remove("active"));
}
function stopDemo() {
  demoTimers.forEach(clearTimeout);
  demoTimers = [];
  voices.forEach((_, key) => {
    if (key.startsWith("demo")) stopSound(key);
  });
}
function playNotes(notes, spacing = 450) {
  stopDemo();
  audio();
  notes.forEach((n, i) => {
    demoTimers.push(
      setTimeout(() => {
        startSound(n, 0.7, `demo:${i}`);
        highlight(n, true);
        demoTimers.push(
          setTimeout(() => {
            stopSound(`demo:${i}`);
            highlight(n, false);
          }, spacing * 0.8),
        );
      }, i * spacing),
    );
  });
}
function clickSound(accent = false) {
  const ctx = audio(),
    osc = ctx.createOscillator(),
    g = ctx.createGain(),
    t = ctx.currentTime;
  osc.frequency.value = accent ? 1250 : 850;
  g.gain.setValueAtTime(state.volume * 0.22, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(t + 0.07);
  setTimeout(() => g.disconnect(), 150);
}
function highlight(n, on) {
  $$(`.key[data-note="${n}"]`).forEach((k) =>
    k.classList.toggle(
      "active",
      on || [...held].some((h) => Number(h.split(":").at(-1)) === n),
    ),
  );
}
function noteOn(n, source = "screen", velocity = 0.7) {
  lastActivity = Date.now();
  const key = `${source}:${n}`;
  if (held.has(key)) return;
  const alreadyHeldPitch = [...held].some(
    (k) => Number(k.split(":").at(-1)) === n,
  );
  held.add(key);
  try {
    if (!source.startsWith("midi") || state.instrument.localSound)
      startSound(n, velocity, key);
  } catch {
    toast("El audio no está disponible en este navegador.");
  }
  highlight(n, true);
  if (improvLab?.running && !alreadyHeldPitch) improvLab.noteOn(n, velocity);
  if (auralLab && !alreadyHeldPitch) auralLab.noteOn(n);
  if (guidedPractice) {
    if (!alreadyHeldPitch) guidedPractice.noteOn(n, source);
    return;
  }
  const freeNote = $("#free-note");
  if (freeNote) freeNote.textContent = `Suena ${noteName(n)} · MIDI ${n}`;
}
function noteOff(n, source = "screen") {
  const key = `${source}:${n}`;
  const wasHeld = held.has(key);
  held.delete(key);
  if (!(source.startsWith("midi") && midiSustain)) stopSound(key);
  highlight(n, false);
  if (wasHeld && ![...held].some((k) => Number(k.split(":").at(-1)) === n)) {
    guidedPractice?.noteOff(n);
    improvLab?.noteOff(n);
    auralLab?.noteOff(n);
  }
}
const computerKeys = [
  "a",
  "w",
  "s",
  "e",
  "d",
  "f",
  "t",
  "g",
  "y",
  "h",
  "u",
  "j",
  "k",
  "o",
  "l",
  "p",
  ";",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
  ",",
  ".",
  "/",
  "q",
  "r",
  "i",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "-",
  "=",
  "[",
  "]",
  "\\",
];
let computerHeld = new Map();
document.addEventListener("keydown", (e) => {
  if (
    e.target.matches("input,select,textarea") ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  )
    return;
  const index = computerKeys.indexOf(e.key.toLowerCase());
  if (index < 0 || e.repeat) return;
  const piano = $("#lesson-dialog[open] .piano") || $(".piano");
  if (!piano) return;
  e.preventDefault();
  const n = Number(piano.dataset.base) + index;
  computerHeld.set(e.code, n);
  noteOn(n, "computer");
});
document.addEventListener("keyup", (e) => {
  if (computerHeld.has(e.code)) {
    noteOff(computerHeld.get(e.code), "computer");
    computerHeld.delete(e.code);
  }
});
window.addEventListener("resize", () => guidedPractice?.updateVisuals());
window.addEventListener("blur", () => {
  guidedPractice?.suspend();
  improvLab?.stop(false);
  auralLab?.cancel();
  stopAll();
  computerHeld.clear();
  if (rhythm?.running) {
    endRhythm(true);
    feedback("La práctica de ritmo se pausó. Volvé a iniciarla.");
  } else stopMetro();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    guidedPractice?.suspend();
    improvLab?.stop(false);
    auralLab?.cancel();
    stopAll();
    stopDemo();
    if (rhythm?.running) endRhythm(true);
    else stopMetro();
  }
});
function pianoHTML(notes = []) {
  const base = notes.length
    ? Math.max(21, Math.floor(Math.min(...notes) / 12) * 12)
    : 60;
  const end = Math.max(base + 24, ...notes);
  const range = Array.from({ length: end - base + 1 }, (_, i) => base + i),
    whites = range.filter((n) => ![1, 3, 6, 8, 10].includes(n % 12));
  let w = 0;
  return `<div class="piano-scroll"><div class="piano" data-base="${base}">${range
    .map((n) => {
      const black = [1, 3, 6, 8, 10].includes(n % 12);
      const pos = w;
      if (!black) w++;
      const key = computerKeys[n - base];
      return `<button class="key ${black ? "black" : ""}" data-note="${n}" aria-label="${noteName(n)}${key ? ", tecla " + key : ""}" ${black ? `style="left:${((pos - 0.31) / whites.length) * 100}%;width:${(0.62 / whites.length) * 100}%"` : ""}><span>${state.labels ? noteName(n) : ""}</span><small>${key?.toUpperCase() || ""}</small></button>`;
    })
    .join(
      "",
    )}</div></div><div class="keyboard-caption"><span>Click, pantalla táctil o teclado de la compu: A W S E D F T G Y H U J K…</span><span>Do4 = Do central</span></div>`;
}
function bindPiano(root = document) {
  $$(".key", root).forEach((k) => {
    const n = Number(k.dataset.note);
    k.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      k.setPointerCapture(e.pointerId);
      noteOn(n, `pointer${e.pointerId}`);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((evt) =>
      k.addEventListener(evt, (e) => noteOff(n, `pointer${e.pointerId}`)),
    );
    k.addEventListener("keydown", (e) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        e.preventDefault();
        noteOn(n, "accessible");
      }
    });
    k.addEventListener("keyup", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        noteOff(n, "accessible");
      }
    });
  });
}
async function connectMIDI() {
  if (!navigator.requestMIDIAccess) {
    toast(
      "Este navegador no ofrece Web MIDI. Probá Chrome o Edge en localhost.",
    );
    return;
  }
  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: false });
    const attach = () => {
      for (const input of midiAccess.inputs.values())
        input.onmidimessage = (event) => {
          const [status, n, v] = event.data,
            command = status & 240,
            source = `midi${input.id}`;
          if (state.instrument.midiId && state.instrument.midiId !== input.id)
            return;
          if (command === 144 && v > 0)
            updateMIDIMonitor({
              devices: getMIDIDevices(),
              pitch: n,
              velocity: v / 127,
            });
          if (command === 144 && v > 0) noteOn(n, source, v / 127);
          else if (command === 128 || (command === 144 && v === 0))
            noteOff(n, source);
          else if (command === 176 && n === 64) {
            midiSustain = v >= 64;
            if (!midiSustain)
              voices.forEach((_, key) => {
                if (key.startsWith("midi") && !held.has(key)) stopSound(key);
              });
          }
        };
      const connected = [...midiAccess.inputs.values()].filter(
        (i) => i.state === "connected",
      );
      if (
        connected.length &&
        !connected.some((input) => input.id === state.instrument.midiId)
      )
        state.instrument.midiId = connected[0].id;
      updateMIDIMonitor({ devices: getMIDIDevices() });
      $("#midi-button").textContent = connected.length
        ? "Teclado conectado ✓"
        : "Buscar teclado MIDI ↗";
      if (!connected.length)
        toast("Permiso concedido. Conectá un teclado USB MIDI y encendelo.");
      else toast("Teclado conectado. Ya podés tocar.");
      guidedPractice?.suspend();
      stopAll();
      midiSustain = false;
    };
    midiAccess.onstatechange = attach;
    attach();
  } catch (e) {
    toast(
      e.name === "NotAllowedError"
        ? "El permiso MIDI no fue concedido. Podés seguir con el teclado virtual."
        : "No se pudo conectar MIDI. Revisá el cable y que el navegador permita MIDI.",
    );
  }
}
function getMIDIDevices() {
  return [...(midiAccess?.inputs.values() || [])]
    .filter((input) => input.state === "connected")
    .map((input) => ({ id: input.id, name: input.name || "Teclado MIDI" }));
}
function configureInstrument() {
  cleanup();
  openSetup({
    state,
    save,
    connect: connectMIDI,
    getDevices: getMIDIDevices,
    onDone: () => render(),
  });
}
$("#midi-button").onclick = connectMIDI;
function disposeGuided() {
  const old = guidedPractice;
  guidedPractice = null;
  old?.dispose();
}
function cleanup() {
  improvLab?.dispose();
  improvLab = null;
  auralLab?.dispose();
  auralLab = null;
  disposeGuided();
  stopAll();
  stopDemo();
  stopMetro();
  rhythm = null;
  exercise = null;
  ear = null;
}
function navigate(next) {
  if (!pages.some((p) => p[0] === next) && next !== "settings") next = "home";
  cleanup();
  page = next;
  location.hash = next;
  $$("[data-page]").forEach((b) =>
    b.classList.toggle("active", b.dataset.page === page),
  );
  $("#breadcrumb").textContent =
    `Mi espacio / ${pages.find((p) => p[0] === page)?.[1] || "Ajustes"}`;
  render();
  window.scrollTo(0, 0);
}
document.addEventListener("click", (e) => {
  const domainButton = e.target.closest("[data-course-domain]");
  if (domainButton) {
    courseDomain = domainButton.dataset.courseDomain;
    if (page !== "course") navigate("course");
    else render();
  }
  if (e.target.closest("[data-course-reset]")) {
    courseQuery = "";
    courseDomain = "all";
    filter = -1;
    render();
  }
  const b = e.target.closest("[data-page]");
  if (b) navigate(b.dataset.page);
  const l = e.target.closest("[data-lesson]");
  if (l) openLesson(l.dataset.lesson);
  const f = e.target.closest("[data-filter]");
  if (f) {
    filter = Number(f.dataset.filter);
    if (page !== "course") navigate("course");
    else render();
  }
  const t = e.target.closest("[data-tool]");
  if (t) {
    if (dialog.open) dialog.close();
    practiceTab = t.dataset.tool;
    if (page !== "practice") navigate("practice");
    else {
      cleanup();
      render();
    }
  }
});
document.addEventListener("keydown", (e) => {
  if (
    !e.target.closest(".tool-tabs") ||
    !["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
  )
    return;
  e.preventDefault();
  const tabs = $$(".tool-tabs [data-tool]"),
    index = tabs.indexOf(e.target),
    next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? tabs.length - 1
          : (index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length,
    id = tabs[next].dataset.tool;
  tabs[next].click();
  $(`.tool-tabs [data-tool="${id}"]`)?.focus();
});
window.addEventListener("hashchange", () => {
  const next = location.hash.slice(1) || "home";
  if (next !== page) navigate(next);
});
function streak() {
  let days = 0;
  const date = new Date();
  if (!state.days[localDay(date)]) date.setDate(date.getDate() - 1);
  for (let i = 0; i < 3660; i++) {
    if (!state.days[localDay(date)]) break;
    days++;
    date.setDate(date.getDate() - 1);
  }
  return days;
}
function heading(kicker, title, description, extra = "") {
  return `<div class="page-heading"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${description}</p></div>${extra}</div>`;
}
function metrics() {
  return `<div class="metrics">${[
    [
      "clock",
      `${Math.floor(state.seconds / 60)} <small>min</small>`,
      "Tiempo de estudio",
    ],
    [
      "check",
      `${state.completed.length} <small>/ ${lessons.length}</small>`,
      "Lecciones completadas",
    ],
    ["flame", `${streak()} <small>días</small>`, "Tu racha de práctica"],
    [
      "target",
      `${Math.round((state.completed.length / lessons.length) * 100)}<small>%</small>`,
      "De tu recorrido",
    ],
  ]
    .map(
      ([i, n, l]) =>
        `<div class="metric"><span class="metric-icon">${icon(i)}</span><div><strong>${n}</strong><label>${l}</label></div></div>`,
    )
    .join("")}</div>`;
}
function pianoArt() {
  return `<svg viewBox="0 0 440 280" role="img" aria-label="Ilustración de un teclado sobre formas orgánicas"><defs><pattern id="grain" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".6" fill="#ced8b3" opacity=".15"/></pattern></defs><circle cx="250" cy="125" r="107" fill="#a9bd83" opacity=".17"/><circle cx="250" cy="125" r="86" fill="none" stroke="#b4c398" stroke-width=".6" opacity=".4"/><path d="M68 235c20-52 44-75 62-76-6 32-27 55-62 76M67 236c-13-39-9-67 8-87 12 31 7 57-8 87M350 66c8-24 27-42 51-43-4 26-26 40-51 43" fill="#a9bd83" opacity=".5"/><path d="m66 245 42-68m245-110 38-30" stroke="#c3d0a6" fill="none" opacity=".5"/><g transform="translate(80 87) rotate(-12 145 55)"><rect x="-4" y="-14" width="304" height="123" rx="10" fill="#152e26"/><rect width="290" height="98" rx="4" fill="#e8e8ca"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 20.7}" y="0" width="19.7" height="95" rx="2" fill="${i % 4 === 0 ? "#d7dfba" : "#f2f0d8"}"/>`).join("")}${[1, 2, 4, 5, 6, 8, 9, 11, 12, 13].map((i) => `<rect x="${i * 20.7 - 6}" y="0" width="12" height="59" rx="2" fill="#233a2e"/><rect x="${i * 20.7 - 4}" y="0" width="8" height="54" rx="1" fill="#334a3a"/>`).join("")}<rect x="-4" y="-14" width="304" height="14" rx="4" fill="#192e24"/></g><text x="130" y="51" font-family="Georgia" font-size="29" fill="#c2d19d" transform="rotate(-12 130 51)">♪</text><text x="373" y="186" font-family="Georgia" font-size="34" fill="#c2d19d" transform="rotate(13 373 186)">♫</text><circle cx="104" cy="76" r="3" fill="#d3dfb2"/><circle cx="341" cy="227" r="2" fill="#d3dfb2"/><path d="M318 45v12m-6-6h12" stroke="#d3dfb2"/><rect width="440" height="280" fill="url(#grain)"/></svg>`;
}
function home() {
  const next =
    lessons.find((l) => !state.completed.includes(l.id)) || lessons[0];
  return (
    heading(
      "TU MÚSICA EMPIEZA ACÁ",
      "Un buen día para tocar.",
      "No necesitás saber música. Solo tener ganas de empezar.",
      `<span class="date-pill">${icon("target")} Meta diaria: ${state.goal} minutos</span>`,
    ) +
    dailyPlanHTML() +
    `<section class="hero"><div class="hero-content"><span class="eyebrow">${state.completed.length ? "SEGUÍ DESCUBRIENDO" : "DE TU PRIMERA NOTA A TU PROPIA MÚSICA"}</span><h2>Las teclas son el comienzo.<br><em>La música la ponés vos.</em></h2><p>Un camino a tu ritmo, con lecciones claras y práctica real. Paso a paso, de principiante a avanzado.</p><button class="primary" data-lesson="${next.id}">${state.completed.length ? "Continuar mi recorrido" : "Empezar mi primera lección"} <span>↗</span></button></div><div class="hero-art">${pianoArt()}<span class="art-caption">UN INSTRUMENTO. INFINITAS POSIBILIDADES.</span></div></section>${metrics()}<div class="section-title"><h2>Tu camino en el teclado</h2><button class="text-button" data-page="course">Ver todo el recorrido <span>↗</span></button></div><section class="journey" aria-label="Niveles del curso">${levels
      .map((l, i) => {
        const subset = lessons.filter((x) => x.level === i),
          done = subset.filter((x) => state.completed.includes(x.id)).length;
        return `<button class="level-card ${next.level === i ? "current" : ""}" data-filter="${i}"><div class="level-top"><div class="level-icon ${l.color}">${["♩", "♫", "♬", "𝄞"][i]}</div><span>${next.level === i ? "ESTÁS ACÁ" : "0" + (i + 1) + " →"}</span></div><span class="eyebrow">${l.tag}</span><h3>${l.name}</h3><p>${subset.length} lecciones · A tu ritmo</p><div class="progress-track"><span style="width:${(done / subset.length) * 100}%"></span></div><div class="level-foot"><span>${done ? "En marcha" : "Por descubrir"}</span><span>${done}/${subset.length}</span></div></button>`;
      })
      .join(
        "",
      )}</section><div class="home-bottom"><section><div class="section-title"><h2>Un poco de práctica</h2><span class="eyebrow" style="font-size:8px">HACÉLO TUYO</span></div><div class="practice-shortcuts">${[
      [
        "guided",
        "piano",
        "Mi práctica visual",
        "Partitura, teclas y duración, juntas.",
      ],
      ["ear", "ear", "Afiná tu oído", "Aprendé a reconocer intervalos."],
      [
        "rhythm",
        "clock",
        "Encontrá tu ritmo",
        "Un pulso firme, una nota a la vez.",
      ],
    ]
      .map(
        ([t, i, h, p]) =>
          `<button class="shortcut" data-tool="${t}"><span class="shortcut-icon">${icon(i)}</span><span><strong>${h}</strong><small>${p}</small></span><span>↗</span></button>`,
      )
      .join(
        "",
      )}</div></section><section><div class="section-title"><h2>Una nota para hoy</h2></div><div class="daily-note"><span class="eyebrow">MÁS ALLÁ DE LAS TECLAS ${icon("music")}</span><blockquote>“No hace falta tocar perfecto.<br>Hace falta volver a sentarse.”</blockquote><div class="note-line"></div><p>Diez minutos con atención valen más que una hora en piloto automático. Hoy, disfrutá el proceso.</p></div></section></div>`
  );
}
function dailyPlanHTML() {
  const plan = buildDailyPlan(state, lessons);
  return `<section class="daily-plan"><div class="section-title"><div><span class="eyebrow">UNA SESIÓN POSIBLE · ${state.goal} MINUTOS</span><h2>Hoy, un poco más de música.</h2></div><button class="text-button" data-page="settings">Ajustar mi plan ↗</button></div><div class="daily-plan-steps">${plan.map((item, i) => `<button ${item.lesson ? `data-lesson="${item.lesson}"` : item.tool ? `data-tool="${item.tool}"` : `data-page="${item.page || "course"}"`}><span class="plan-index">0${i + 1}</span><div><strong>${item.title}</strong><small>${esc(item.detail)}</small></div><span>${item.minutes} min ↗</span></button>`).join("")}</div></section>`;
}
function course() {
  return courseHTML({
    state,
    lessons,
    levels,
    level: filter,
    domain: courseDomain,
    query: courseQuery,
  });
}
function practice() {
  return (
    heading(
      "ESCUCHÁ. PROBÁ. REPETÍ.",
      "Tu sala de práctica.",
      "Un espacio para convertir lo que sabés en lo que tocás.",
      `<button class="secondary" data-page="settings">${icon("settings")} Ajustes</button>`,
    ) +
    `<div class="tool-tabs" role="tablist" aria-label="Herramientas">${[
      ["guided", "Práctica visual"],
      ["improv", "Improvisación"],
      ["free", "Teclado libre"],
      ["scales", "Escalas"],
      ["chords", "Acordes"],
      ["reading", "Lectura"],
      ["ear", "Oído"],
      ["rhythm", "Ritmo"],
    ]
      .map(
        ([id, title]) =>
          `<button id="practice-tab-${id}" role="tab" aria-controls="tool-content" tabindex="${id === practiceTab ? 0 : -1}" aria-selected="${id === practiceTab}" class="${id === practiceTab ? "active" : ""}" data-tool="${id}">${title}</button>`,
      )
      .join(
        "",
      )}</div><section class="panel" id="tool-content" role="tabpanel" aria-labelledby="practice-tab-${practiceTab}"></section><section class="panel"><span class="eyebrow">TU SESIÓN DE HOY</span><div class="controls"><strong class="session-clock">${Math.floor((state.days[localDay()] || 0) / 60)} / ${state.goal} min</strong><span class="hint">El tiempo cuenta mientras usás la app. Una pausa también es parte de practicar.</span></div><div class="progress-track"><span style="width:${Math.min(100, ((state.days[localDay()] || 0) / (state.goal * 60)) * 100)}%"></span></div></section>`
  );
}
function renderTool() {
  const root = $("#tool-content");
  if (!root) return;
  if (practiceTab === "guided") {
    root.innerHTML = `<div class="guided-intro">${icon("piano")}<p><strong>De la partitura a tus manos.</strong> Para tu instrumento: mirá el ejemplo, tocá a tu ritmo y después probá con pulso. Tus ayudas y velocidad quedan guardadas.</p></div><label class="study-picker" for="guided-study">Qué quiero practicar hoy<select id="guided-study">${guidedStudies.map((s, i) => `<option value="${i}">${s.title}</option>`).join("")}</select></label><div id="guided-study-content"></div>`;
    const load = () =>
      mountGuided(
        $("#guided-study-content"),
        guidedStudies[Number($("#guided-study").value)],
      );
    $("#guided-study").onchange = load;
    load();
    return;
  }
  if (practiceTab === "improv") {
    improvLab = new ImprovisationLab(root, {
      pianoHTML,
      bindPiano,
      audioReady: audio,
      click: clickSound,
      soundOn: (n, key, velocity = 0.3) => startSound(n, velocity, key),
      soundOff: stopSound,
      onResult: (r) => {
        state.improvisation = [...state.improvisation, r].slice(-40);
        save();
      },
    });
    return;
  }
  if (practiceTab === "ear") {
    auralLab = new AuralLab(root, {
      pianoHTML,
      bindPiano,
      audioReady: audio,
      soundOn: (n, key) => startSound(n, 0.65, key),
      soundOff: stopSound,
      silence: () =>
        voices.forEach((_, key) => {
          if (key.startsWith("aural:")) stopSound(key);
        }),
    });
    return;
  }
  if (practiceTab === "free") {
    root.innerHTML = `<h2>Que suene tu curiosidad.</h2><p>Probá una melodía, buscá un acorde o simplemente escuchá. Podés usar mouse, pantalla táctil, tu computadora o un teclado MIDI.</p><div class="controls"><label>Volumen <input aria-label="Volumen" id="volume" type="range" min="0" max="1" step="0.05" value="${state.volume}"></label><label>Registro <select id="octave"><option value="48">Do3–Do5 · Grave</option><option value="60" selected>Do4–Do6 · Central</option><option value="72">Do5–Do7 · Agudo</option></select></label><label><input id="show-labels" type="checkbox" ${state.labels ? "checked" : ""}> Mostrar notas</label></div><div id="free-piano">${pianoHTML()}</div><div class="feedback" id="free-note" aria-live="polite">Tu próxima nota puede ser el comienzo de algo.</div><p class="hint">El sonido es una síntesis local de teclado. MIDI recibe las notas del instrumento, sin grabar audio ni usar el micrófono.</p>`;
    $("#volume").oninput = (e) => {
      state.volume = Number(e.target.value);
      save();
    };
    $("#show-labels").onchange = (e) => {
      state.labels = e.target.checked;
      save();
      $("#free-piano").innerHTML = pianoHTML([Number($("#octave").value)]);
      bindPiano(root);
    };
    $("#octave").onchange = (e) => {
      stopAll();
      $("#free-piano").innerHTML = pianoHTML([Number(e.target.value)]);
      bindPiano(root);
    };
    bindPiano(root);
    return;
  }
  if (practiceTab === "scales") {
    root.innerHTML =
      '<h2>Una escala, muchas posibilidades.</h2><div class="controls"><label>Tónica <select id="root-note">' +
      [
        [60, "Do"],
        [61, "Re♭"],
        [62, "Re"],
        [63, "Mi♭"],
        [64, "Mi"],
        [65, "Fa"],
        [66, "Fa♯"],
        [67, "Sol"],
        [68, "La♭"],
        [69, "La"],
        [70, "Si♭"],
        [71, "Si"],
      ]
        .map(([n, l]) => `<option value="${n}">${l}</option>`)
        .join("") +
      '</select></label><label>Escala <select id="scale-type"><option value="major">Mayor</option><option value="minor">Menor natural</option><option value="harmonic">Menor armónica</option><option value="pentatonic">Pentatónica mayor</option><option value="blues">Blues menor</option></select></label></div><div id="generated-exercise"></div>';
    const generate = () => {
      stopDemo();
      stopAll();
      const r = Number($("#root-note").value),
        pattern = {
          major: [0, 2, 4, 5, 7, 9, 11, 12],
          minor: [0, 2, 3, 5, 7, 8, 10, 12],
          harmonic: [0, 2, 3, 5, 7, 8, 11, 12],
          pentatonic: [0, 2, 4, 7, 9, 12],
          blues: [0, 3, 5, 6, 7, 10, 12],
        }[$("#scale-type").value];
      setupExercise(
        {
          type: "sequence",
          notes: pattern.map((x) => r + x),
          noteLabels: spellNotes(
            r,
            pattern,
            { pentatonic: [0, 1, 2, 4, 5, 7], blues: [0, 2, 3, 4, 4, 6, 7] }[
              $("#scale-type").value
            ] || [0, 1, 2, 3, 4, 5, 6, 7],
          ),
        },
        $("#generated-exercise"),
      );
    };
    $("#root-note").onchange = generate;
    $("#scale-type").onchange = generate;
    generate();
    return;
  }
  if (practiceTab === "chords") {
    root.innerHTML =
      '<h2>Encontrá el color de cada acorde.</h2><div class="controls"><label>Fundamental <select id="chord-root">' +
      [
        [60, "Do"],
        [61, "Re♭"],
        [62, "Re"],
        [63, "Mi♭"],
        [64, "Mi"],
        [65, "Fa"],
        [66, "Fa♯"],
        [67, "Sol"],
        [68, "La♭"],
        [69, "La"],
        [70, "Si♭"],
        [71, "Si"],
      ]
        .map(([n, l]) => `<option value="${n}">${l}</option>`)
        .join("") +
      '</select></label><label>Tipo <select id="chord-type"><option value="major">Mayor</option><option value="minor">Menor</option><option value="dim">Disminuido</option><option value="maj7">maj7</option><option value="dom7">7 (dominante)</option><option value="m7">m7</option><option value="maj9">maj9</option></select></label></div><div id="generated-exercise"></div>';
    const generate = () => {
      stopDemo();
      stopAll();
      const r = Number($("#chord-root").value),
        pattern = {
          major: [0, 4, 7],
          minor: [0, 3, 7],
          dim: [0, 3, 6],
          maj7: [0, 4, 7, 11],
          dom7: [0, 4, 7, 10],
          m7: [0, 3, 7, 10],
          maj9: [0, 4, 7, 11, 14],
        }[$("#chord-type").value];
      setupExercise(
        {
          type: "chord",
          notes: pattern.map((x) => r + x),
          noteLabels: spellNotes(
            r,
            pattern,
            pattern.length === 5 ? [0, 2, 4, 6, 8] : [0, 2, 4, 6],
          ),
        },
        $("#generated-exercise"),
      );
    };
    $("#chord-root").onchange = generate;
    $("#chord-type").onchange = generate;
    generate();
    return;
  }
  if (practiceTab === "reading") {
    root.innerHTML =
      '<h2>De la partitura a tus manos.</h2><div class="controls"><label>Clave <select id="reading-clef"><option value="treble">Sol</option><option value="bass">Fa</option></select></label></div><div id="generated-exercise"></div>';
    const generate = () => {
      const bass = $("#reading-clef").value === "bass";
      const pool = bass
        ? [43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60]
        : [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77];
      setupExercise(
        {
          type: "reading",
          clef: bass ? "bass" : "treble",
          notes: Array.from(
            { length: 8 },
            () => pool[Math.floor(Math.random() * pool.length)],
          ),
        },
        $("#generated-exercise"),
      );
    };
    $("#reading-clef").onchange = generate;
    generate();
    return;
  }
  if (practiceTab === "ear") {
    setupEar(root);
    return;
  }
  if (practiceTab === "rhythm") setupRhythm(root);
}
function library() {
  return libraryHTML();
}
function progress() {
  return (
    heading(
      "MIRÁ TODO LO QUE VAS CONSTRUYENDO",
      "Cada práctica suma.",
      "Tu progreso se guarda en este navegador. Exportalo para llevarlo a otro equipo.",
    ) +
    metrics() +
    `<div class="grid-two"><section class="panel"><h2>Tu recorrido, de un vistazo.</h2>${levels
      .map((l, i) => {
        const set = lessons.filter((x) => x.level === i),
          done = set.filter((x) => state.completed.includes(x.id)).length;
        return `<div class="progress-level"><header><span>${l.name}</span><span>${done}/${set.length}</span></header><div class="progress-track"><span style="width:${(done / set.length) * 100}%"></span></div></div>`;
      })
      .join(
        "",
      )}</section><section class="panel"><h2>Volver es lo que importa.</h2><p>Tu actividad en los últimos 14 días.</p><div class="activity">${Array.from(
      { length: 14 },
      (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 13 + i);
        const key = localDay(d);
        return `<span class="activity-day ${state.days[key] ? "practiced" : ""}" title="${key}: ${Math.round((state.days[key] || 0) / 60)} minutos">${d.getDate()}</span>`;
      },
    ).join(
      "",
    )}</div><p class="hint">Un día con actividad aparece en verde. La racha cuenta días consecutivos de uso, incluyendo hoy o ayer.</p></section></div><section class="panel"><h2>Lecciones que ya hiciste tuyas.</h2>${
      state.completed.length
        ? `<div class="lesson-list">${lessons
            .filter((l) => state.completed.includes(l.id))
            .map(
              (l) =>
                `<button class="lesson-row" data-lesson="${l.id}"><span class="lesson-number">✓</span><span><strong>${l.title}</strong><small>Práctica de notas / pulso: ${state.scores[l.id] ?? "—"}% · Instrumento: autoevaluado</small></span></button>`,
            )
            .join("")}</div>`
        : '<div class="empty">Cada camino empieza con una nota.<br><button class="text-button" data-lesson="postura">Empezar la primera lección ↗</button></div>'
    }</section>` +
    learningProgressHTML()
  );
}
function learningProgressHTML() {
  return `<section class="panel evidence-panel"><div class="section-title"><div><span class="eyebrow">LO QUE VENÍS CONSTRUYENDO</span><h2>Más que un porcentaje.</h2></div><span class="hint">Los ejercicios afianzados tienen evidencia en dos días.</span></div><div class="evidence-domains">${studyDomains
    .map((d) => {
      const p = domainProgress(state, lessons, d.id);
      return `<div><strong>${d.name}</strong><div class="progress-track"><span style="width:${(p.practiced / p.total) * 100}%"></span></div><small>${p.practiced} en práctica · ${p.mastered} ejercicios afianzados · ${p.total} lecciones</small></div>`;
    })
    .join(
      "",
    )}</div><p class="hint">Las marcas de ejercicios no son una certificación de nivel artístico. Las tomas con ayuda siguen siendo práctica valiosa; para evidencia técnica retiramos los nombres y usamos pulso.</p></section><div class="grid-two"><section class="panel"><span class="eyebrow">ESCUCHARTE TAMBIÉN ES ESTUDIAR</span><h2>Tu cuaderno de práctica.</h2><form id="journal-form"><label class="field">Qué salió y qué vas a cambiar<textarea id="journal-text" maxlength="1000" rows="3" placeholder="Hoy el bajo quedó más estable. Mañana trabajo el enlace del compás 3…" required></textarea></label><button class="secondary" type="submit">Guardar una nota →</button></form><div class="journal-entries">${
    state.journal
      .slice(-5)
      .reverse()
      .map(
        (j) =>
          `<article><time>${new Date(j.at).toLocaleDateString("es")}</time><p>${esc(j.text)}</p></article>`,
      )
      .join("") ||
    '<p class="hint">Tus notas se guardan en este equipo y viajan en tu copia completa.</p>'
  }</div></section><section class="panel"><span class="eyebrow">MÚSICA PROPIA</span><h2>Tu práctica creativa.</h2>${state.improvisation.length ? `<strong class="creative-count">${state.improvisation.length}</strong><p>tomas de improvisación registradas en tu historial reciente.</p><p class="hint">Última toma: ${state.improvisation.at(-1).notes} notas · ${state.improvisation.at(-1).bpm} BPM. Volvé a escuchar tus decisiones antes de sumar más notas.</p>` : "<p>Probá una pregunta de dos notas y una respuesta. Dejá un silencio para escuchar lo que acabás de tocar.</p>"}<button class="dark-button" data-tool="improv">Ir al laboratorio creativo ↗</button></section></div>`;
}
function bindJournal() {
  const form = $("#journal-form");
  if (form)
    form.onsubmit = (e) => {
      e.preventDefault();
      const text = $("#journal-text").value.trim();
      if (!text) return;
      state.journal = [...state.journal, { at: Date.now(), text }].slice(-80);
      save();
      render();
      toast("Nota guardada en tu cuaderno.");
    };
}
function settings() {
  return (
    instrumentSettingsHTML(state) +
    heading(
      "HACÉ ESTE ESPACIO TUYO",
      "A tu manera.",
      "Todo funciona en tu computadora, sin cuentas ni servicios externos.",
    ) +
    `<div class="grid-two"><section class="panel"><h2>Tu práctica diaria</h2><label class="field">Meta diaria<select id="daily-goal">${[10, 15, 20, 30, 45].map((n) => `<option value="${n}" ${state.goal === n ? "selected" : ""}>${n} minutos</option>`).join("")}</select></label><label class="field">Volumen<input id="settings-volume" type="range" min="0" max="1" step="0.05" value="${state.volume}"></label><p class="hint">Una sesión posible: 3 min de entrada en calor, 5 de técnica, 5 de repertorio y 2 de exploración. Adaptala a tu nivel.</p></section><section class="panel"><h2>Tu progreso te pertenece</h2><p>Exportá una copia completa para llevar tus avances, favoritos y arreglos MIDI a la app de escritorio o a otro navegador. Borrar los datos del navegador elimina su guardado local.</p><div class="controls"><button class="secondary" id="export-progress">Exportar copia completa ↓</button><button class="secondary" id="import-progress">Importar copia ↑</button><input type="file" id="import-file" accept="application/json,.json" hidden></div><p class="settings-info">${storageOk ? "Guardado local disponible." : "El almacenamiento local no está disponible. Exportá una copia antes de cerrar."}</p><button class="text-button danger" id="reset-progress">Reiniciar mi progreso</button></section></div><section class="panel"><h2>Del navegador a tu instrumento</h2><p>La app ofrece sonido sintetizado, entrada por mouse, pantalla táctil y teclado de computadora. Para recibir notas de un teclado USB MIDI, usá un navegador con Web MIDI y concedé el permiso al conectar.</p><button class="secondary" id="settings-midi">Conectar teclado MIDI ↗</button><p class="hint">La práctica visual verifica notas y duración por MIDI; en el modo con pulso también comprueba los ataques; no analiza tu postura ni escucha el audio de un instrumento acústico. Las prácticas de coordinación, expresión, pedal y repertorio incluyen una autoevaluación en tu instrumento.</p></section><section class="panel"><h2>Profundizá lo aprendido</h2><p>El programa incluye fundamentos, lectura, técnica, armonía, oído e introducción a recursos avanzados. Dominar un instrumento requiere práctica sostenida y feedback sobre cómo tocás.</p><p class="hint">Referencia para ampliar teoría: <a class="source-link" href="https://viva.pressbooks.pub/openmusictheory/" target="_blank" rel="noreferrer">Open Music Theory</a>. Compatibilidad MIDI: <a class="source-link" href="https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API" target="_blank" rel="noreferrer">MDN Web MIDI</a>. Las lecciones están redactadas para esta app.</p></section>`
  );
}
function bindSettings() {
  $("#daily-goal").onchange = (e) => {
    state.goal = Number(e.target.value);
    save();
    toast("Meta diaria actualizada.");
  };
  $("#settings-volume").oninput = (e) => {
    state.volume = Number(e.target.value);
    save();
  };
  $("#settings-midi").onclick = connectMIDI;
  $("#export-progress").onclick = async () => {
    save();
    try {
      const library = await libraryRequest("getAll");
      const blob = new Blob(
          [
            JSON.stringify(
              { ...state, library, backupFormat: "clavia-backup-v2" },
              null,
              2,
            ),
          ],
          {
            type: "application/json",
          },
        ),
        url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = `clavia-progreso-${localDay()}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("Copia completa exportada: progreso, favoritos y MIDI.");
    } catch (e) {
      toast(e.message);
    }
  };
  $("#import-progress").onclick = () => $("#import-file").click();
  $("#import-file").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 20_000_000) throw Error("Archivo demasiado grande");
      const data = JSON.parse(await file.text());
      const candidate = validateState(data);
      if (
        data.library !== undefined &&
        (!Array.isArray(data.library) || data.library.length > 100)
      )
        throw Error("Repertorio inválido");
      const imported = (data.library || []).map(validateImportedPiece);
      if (
        !confirm(
          "¿Reemplazar tu progreso y favoritos por esta copia? Sus MIDI se suman al repertorio; las piezas con el mismo identificador se reemplazan.",
        )
      )
        return;
      if (imported.length) await libraryRequest("putMany", imported);
      state = candidate;
      save();
      render();
      toast("Tu progreso ya está acá.");
    } catch {
      toast(
        "No se pudo importar. Elegí una copia JSON exportada desde Clavia.",
      );
    }
  };
  $("#reset-progress").onclick = () => {
    if (
      confirm(
        "¿Borrar todo el progreso de Clavia en este navegador? Podés exportar una copia antes.",
      )
    ) {
      state = defaultState();
      save();
      render();
      toast("Progreso reiniciado.");
    }
  };
}
function render() {
  $("#main").innerHTML = {
    home,
    course,
    practice,
    library,
    progress,
    settings,
  }[page]();
  if (page === "practice") renderTool();
  if (page === "course")
    bindCourse({
      state,
      lessons,
      levels,
      level: filter,
      domain: courseDomain,
      query: courseQuery,
      onQuery: (value) => {
        courseQuery = value;
      },
    });
  if (page === "progress") bindJournal();
  if (page === "settings") {
    bindSettings();
    bindInstrumentSettings({
      state,
      save,
      getDevices: getMIDIDevices,
      onDevice: () => {
        stopAll();
      },
      openSetup: configureInstrument,
    });
    updateMIDIMonitor({ devices: getMIDIDevices() });
  }
  if (page === "library")
    bindLibrary({ state, save, toast, openPiece, cleanup, dialog });
}
function feedback(text, error = false) {
  const el =
    $("#lesson-dialog[open] #exercise-feedback") || $("#exercise-feedback");
  if (el) {
    el.textContent = text;
    el.classList.toggle("error", error);
  }
}
function mountGuided(root, score, onPass = () => {}, onResult = () => {}) {
  disposeGuided();
  stopAll();
  stopDemo();
  guidedPractice = new GuidedPractice(root, score, {
    preferences: {
      ...state.guided,
      keyboard: state.instrument.keys,
      firstNote: state.instrument.firstNote,
    },
    instrument: state.instrument,
    onPreferences: (value) => {
      state.guided = value;
      state.instrument.keys = value.keyboard;
      state.instrument.firstNote = value.firstNote;
      save();
    },
    onPass,
    onResult,
    pianoHTML,
    bindPiano,
    audioReady: audio,
    click: clickSound,
    soundOn: (n, key) => startSound(n, 0.65, key),
    soundOff: stopSound,
    silenceGuides: () =>
      voices.forEach((_, key) => {
        if (key.startsWith("coach:") || key.startsWith("coach-peek:"))
          stopSound(key);
      }),
    releaseInput: () => {
      stopAll();
      computerHeld.clear();
    },
  });
}
function setupExercise(config, root, onPass = () => {}) {
  disposeGuided();
  stopAll();
  stopDemo();
  exercise = {
    ...config,
    index: 0,
    errors: 0,
    passed: false,
    buffer: new Set(),
    onPass,
  };
  if (config.type === "ear") {
    setupEar(root, onPass);
    return;
  }
  if (config.type === "rhythm") {
    setupRhythm(root, onPass);
    return;
  }
  mountGuided(root, scoreFromExercise(config), onPass, (result) => {
    if (config.lessonId) {
      recordLessonAttempt(state, config.lessonId, result);
      save();
    }
  });
}
function stopMetro() {
  if (metronome) {
    clearInterval(metronome);
    metronome = null;
  }
  $$(".beat.on").forEach((b) => b.classList.remove("on"));
  const b = $("#metro-toggle");
  if (b) b.textContent = "Escuchar metrónomo";
}
function flashBeat() {
  const el = $$(`.beat`);
  el.forEach((b, i) => b.classList.toggle("on", i === beat % 4));
  beat++;
}
function setupRhythm(root, onPass = () => {}) {
  stopMetro();
  exercise = { type: "rhythm", passed: false };
  rhythm = { running: false, taps: [], start: 0, bpm: 60, count: 8, onPass };
  root.innerHTML = `<h2>Un pulso a la vez.</h2><p>Escuchá cuatro pulsos de entrada. Después tocá el botón exactamente ocho veces, una por pulso. Se mide el desvío respecto del metrónomo.</p><div class="controls"><label>Tempo <input id="bpm" type="range" min="40" max="160" value="60" step="1"><strong id="bpm-label">60 BPM</strong></label><button class="secondary" id="metro-toggle">Escuchar metrónomo</button></div><div class="beats" aria-hidden="true">${Array.from({ length: 4 }, () => '<span class="beat"></span>').join("")}</div><div class="controls"><button class="dark-button" id="rhythm-start">Iniciar prueba de 8 pulsos</button></div><button class="tap-button" id="rhythm-tap" disabled>Tocá acá siguiendo el pulso</button><div class="feedback" id="exercise-feedback" role="status" aria-live="polite">Primero podés escuchar el metrónomo. Después iniciá la prueba.</div><p class="hint">Usá el botón con mouse, tacto o barra espaciadora cuando tenga foco. El ejercicio mide ataques en esta pantalla, no sonidos del micrófono.</p>`;
  $("#bpm").oninput = (e) => {
    if (rhythm.running) return;
    rhythm.bpm = Number(e.target.value);
    $("#bpm-label").textContent = `${rhythm.bpm} BPM`;
    stopMetro();
  };
  $("#metro-toggle").onclick = () => {
    if (rhythm.running) return;
    if (metronome) {
      stopMetro();
      return;
    }
    beat = 0;
    clickSound(true);
    flashBeat();
    metronome = setInterval(() => {
      clickSound(beat % 4 === 0);
      flashBeat();
    }, 60000 / rhythm.bpm);
    $("#metro-toggle").textContent = "Detener metrónomo";
  };
  $("#rhythm-start").onclick = () => {
    stopMetro();
    rhythm.running = true;
    rhythm.taps = [];
    $("#rhythm-tap").textContent = "Tocá acá siguiendo el pulso";
    rhythm.period = 60000 / rhythm.bpm;
    rhythm.start = performance.now() + rhythm.period * 4;
    beat = 0;
    $("#rhythm-tap").disabled = false;
    $("#bpm").disabled = true;
    $("#metro-toggle").disabled = true;
    $("#rhythm-start").disabled = true;
    let tick = 0;
    clickSound(true);
    flashBeat();
    feedback("Cuenta de entrada: 1 de 4. Esperá…");
    metronome = setInterval(() => {
      tick++;
      if (tick >= 13) {
        endRhythm(true);
        return;
      }
      clickSound(tick % 4 === 0);
      flashBeat();
      if (tick < 4) feedback(`Cuenta de entrada: ${tick + 1} de 4. Esperá…`);
      else if (tick === 4) feedback("¡Ahora! Tocá ocho pulsos.");
    }, rhythm.period);
  };
  const tap = () => {
    if (!rhythm?.running) return;
    const now = performance.now();
    if (now < rhythm.start - rhythm.period * 0.35) {
      feedback(
        "Todavía estamos en la entrada. Escuchá los cuatro clics.",
        true,
      );
      return;
    }
    rhythm.taps.push(now);
    $("#rhythm-tap").textContent = `${rhythm.taps.length} / 8 pulsos`;
    if (rhythm.taps.length === 8) endRhythm(false);
  };
  $("#rhythm-tap").onpointerdown = (e) => {
    e.preventDefault();
    tap();
  };
  $("#rhythm-tap").onkeydown = (e) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
      e.preventDefault();
      tap();
    }
  };
}
function endRhythm(incomplete) {
  if (!rhythm) return;
  rhythm.running = false;
  stopMetro();
  $("#bpm").disabled = false;
  $("#metro-toggle").disabled = false;
  $("#rhythm-start").disabled = false;
  $("#rhythm-tap").disabled = true;
  if (incomplete) {
    feedback(
      `Llegaron ${rhythm.taps.length} de 8 ataques. Volvé a iniciar y seguí los clics.`,
      true,
    );
    return;
  }
  const { error, score, passed } = scoreRhythm(
    rhythm.taps,
    rhythm.start,
    rhythm.period,
  );
  feedback(
    `Precisión rítmica: ${score}%. Desvío medio: ${Math.round(error)} ms. ${passed ? "¡Pulso firme!" : "Buscá al menos 70%. Escuchá la entrada y repetí."}`,
    !passed,
  );
  if (passed) {
    exercise.passed = true;
    rhythm.onPass(score);
  }
}
function setupEar(root, onPass = () => {}) {
  exercise = { type: "ear", passed: false };
  ear = { interval: 0, root: 60, correct: 0, attempts: 0, onPass };
  root.innerHTML = `<h2>Escuchá lo que hay entre dos notas.</h2><p>Identificá el intervalo ascendente. Hacé tres respuestas correctas para completar una ronda. Podés volver a escuchar antes de responder.</p><div class="controls"><button class="dark-button" id="ear-play">${icon("ear")} Escuchar intervalo</button><button class="secondary" id="ear-next">Nuevo intervalo</button></div><div class="answer-grid" id="ear-answers">${[
    [2, "Segunda mayor"],
    [4, "Tercera mayor"],
    [7, "Quinta justa"],
    [12, "Octava justa"],
  ]
    .map(
      ([v, t]) => `<button class="answer" data-interval="${v}">${t}</button>`,
    )
    .join(
      "",
    )}</div><div class="feedback" id="exercise-feedback" role="status" aria-live="polite">Dale a escuchar para empezar. No hace falta adivinar rápido.</div><p class="hint">Una nota de referencia cambia en cada pregunta. Escuchá la distancia entre los sonidos, no solo su registro.</p>`;
  newEar();
  $("#ear-play").onclick = () => {
    ear.listened = true;
    playNotes([ear.root, ear.root + ear.interval], 650);
  };
  $("#ear-next").onclick = () => {
    newEar();
    feedback(`${ear.correct} de 3 correctas. Escuchá un nuevo intervalo.`);
  };
  $$("[data-interval]", root).forEach(
    (b) =>
      (b.onclick = () => {
        if (ear.answered || exercise.passed) return;
        if (!ear.listened) {
          feedback("Escuchá el intervalo antes de responder.", true);
          return;
        }
        ear.attempts++;
        ear.answered = true;
        const correct = Number(b.dataset.interval) === ear.interval;
        b.classList.add(correct ? "correct" : "wrong");
        if (correct) ear.correct++;
        feedback(
          correct
            ? `¡Sí! ${ear.correct} de 3 respuestas correctas. ${ear.correct < 3 ? "Elegí “Nuevo intervalo” para seguir." : ""}`
            : `Era ${$(`[data-interval="${ear.interval}"]`, root).textContent.toLowerCase()}. Volvé a escucharlo y después elegí “Nuevo intervalo”.`,
          !correct,
        );
        if (ear.correct >= 3) {
          exercise.passed = true;
          const score = Math.round((ear.correct / ear.attempts) * 100);
          feedback(`¡Ronda completa! ${score}% de respuestas correctas.`);
          ear.onPass(score);
        }
      }),
  );
}
function newEar() {
  if (exercise.passed) {
    ear.correct = 0;
    ear.attempts = 0;
    exercise.passed = false;
  }
  ear.interval = [2, 4, 7, 12][Math.floor(Math.random() * 4)];
  ear.root = 55 + Math.floor(Math.random() * 10);
  ear.listened = false;
  ear.answered = false;
  $$("[data-interval]").forEach((b) => b.classList.remove("correct", "wrong"));
  stopDemo();
}
const dialog = $("#lesson-dialog");
function openLesson(id) {
  cleanup();
  if (page === "practice") $("#tool-content").innerHTML = "";
  lesson = lessons.find((l) => l.id === id);
  if (!lesson) return;
  lessonStep = 0;
  quizPassed = false;
  lessonExercisePassed = false;
  dialog.showModal();
  renderLesson();
}
function openPiece(piece) {
  cleanup();
  if (page === "practice") $("#tool-content").innerHTML = "";
  lesson = null;
  dialog.innerHTML = `<div class="dialog-head"><div><span class="eyebrow">${esc(piece.level)} · REPERTORIO</span><h2 id="lesson-title">${esc(piece.title)}</h2></div><button class="close" aria-label="Cerrar">×</button></div><div class="dialog-body"><p>${esc(piece.artist)} · ${esc(piece.detail)}</p><p class="hint">Empezá escuchando. Después practicá cada mano por separado y juntalas a un tempo cómodo. Solo una vuelta completa con todas las notas cuenta como pieza completada.</p>${rangeMismatch(piece.score, state.instrument) ? `<p class="range-warning">Esta pieza incluye ${rangeMismatch(piece.score, state.instrument)} notas fuera del registro configurado. Podés escucharla; para tocarla completa, revisá tu instrumento o importá una adaptación explícita.</p>` : ""}<div id="piece-exercise"></div></div>`;
  dialog.showModal();
  $(".close", dialog).onclick = () => dialog.close();
  state.guided.hand = "both";
  mountGuided(
    $("#piece-exercise"),
    piece.score,
    () =>
      toast(
        new Set(piece.score.notes.map((n) => n.hand)).size === 2
          ? "¡Pieza completa con ambas manos!"
          : "¡Pieza completa!",
      ),
    (result) => {
      const previous = state.repertoire[piece.id] || {
        attempts: 0,
        best: 0,
        completed: false,
      };
      state.repertoire[piece.id] = {
        attempts: previous.attempts + 1,
        best: result.full
          ? Math.max(previous.best, result.score)
          : previous.best,
        completed: previous.completed || (result.full && result.passed),
        last: Date.now(),
        mode: result.mode,
        bpm: result.bpm,
      };
      save();
    },
  );
}
function renderLesson() {
  disposeGuided();
  stopAll();
  stopDemo();
  stopMetro();
  rhythm = null;
  exercise = null;
  const steps = ["Comprender", "Tocar", "Comprobar", "Al instrumento"];
  dialog.innerHTML = `<div class="dialog-head"><div><span class="eyebrow">${levels[lesson.level].tag} · LECCIÓN ${lessons.indexOf(lesson) + 1} · ${lesson.minutes} MIN</span><h2 id="lesson-title">${lesson.title}</h2><span class="hint">${lesson.subtitle}</span></div><button class="close" aria-label="Cerrar lección">×</button></div><div class="dialog-body"><div class="lesson-steps">${steps.map((s, i) => `<span class="${i === lessonStep ? "active" : ""}">${i < lessonStep ? "✓" : i + 1} ${s}</span>`).join("")}</div><div id="lesson-content"></div></div>`;
  $(".close", dialog).onclick = () => dialog.close();
  const content = $("#lesson-content");
  if (lessonStep === 0) {
    content.innerHTML =
      `<div class="lesson-objective"><span class="eyebrow">QUÉ VAS A PODER TRABAJAR</span><p>${esc(lesson.mastery?.statement || lesson.challenge)}</p><small>${esc(lesson.mastery?.limitation || "La práctica registra alturas y tiempos; postura y expresión requieren observarte y escucharte.")}</small></div>` +
      lesson.steps
        .map(
          ([title, text], i) =>
            `<section class="theory-section"><h3>${String(i + 1).padStart(2, "0")} / ${title}</h3><p>${text}</p></section>`,
        )
        .join("") +
      `<div class="lesson-actions"><span class="hint">Leé con calma. Después vamos a llevarlo al teclado.</span><button class="dark-button" id="lesson-next">Vamos a tocar →</button></div>`;
  }
  if (lessonStep === 1) {
    content.innerHTML = `${lessonDomain(lesson) === "improvisation" ? '<div class="lesson-lab-link"><p>Este ejemplo prepara la habilidad. Tu improvisación puede tomar otras decisiones.</p><button class="secondary" data-tool="improv">Abrir laboratorio de improvisación ↗</button></div>' : lessonDomain(lesson) === "ear" ? '<div class="lesson-lab-link"><p>Después de esta preparación, entrená con ejemplos nuevos sin ver las notas.</p><button class="secondary" data-tool="ear">Entrenar oído activo ↗</button></div>' : ""}<div id="lesson-exercise"></div><div class="lesson-actions"><button class="text-button" id="lesson-back">← Volver a la explicación</button><button class="dark-button" id="lesson-next" disabled>Comprobar lo aprendido →</button></div>`;
    setupExercise(
      {
        ...lesson.practice,
        title: lesson.title,
        lessonId: lesson.id,
        level: lesson.level,
      },
      $("#lesson-exercise"),
      (score) => {
        lessonExercisePassed = true;
        state.scores[lesson.id] = Math.max(state.scores[lesson.id] || 0, score);
        save();
        $("#lesson-next").disabled = false;
      },
    );
  }
  if (lessonStep === 2) {
    quizPassed = false;
    content.innerHTML = `<h3>${lesson.question}</h3><div class="answer-grid">${lesson.options.map((o, i) => `<button class="answer" data-quiz="${i}">${o}</button>`).join("")}</div><div class="feedback" id="quiz-feedback" role="status" aria-live="polite">Elegí una respuesta. Podés volver a leer la explicación.</div><div class="lesson-actions"><button class="text-button" id="lesson-back">← Volver a practicar</button><button class="dark-button" id="lesson-next" disabled>Llevarlo al instrumento →</button></div>`;
    $$("[data-quiz]").forEach(
      (b) =>
        (b.onclick = () => {
          if (quizPassed) return;
          const correct = Number(b.dataset.quiz) === lesson.answer;
          b.classList.add(correct ? "correct" : "wrong");
          $("#quiz-feedback").textContent = correct
            ? "¡Exacto! Ahora aplicá la idea en tu instrumento."
            : "Revisá la explicación y probá de nuevo.";
          if (correct) {
            quizPassed = true;
            $("#lesson-next").disabled = false;
          }
        }),
    );
  }
  if (lessonStep === 3) {
    content.innerHTML = `<section class="theory-section"><h3>Tu reto en el teclado real</h3><p>${lesson.challenge}</p></section><p class="hint">Esta parte es una autoevaluación. El navegador no comprueba postura, expresión ni coordinación física. Podés cerrar la lección y volver cuando hayas practicado.</p><div class="checklist"><label><input type="checkbox" id="challenge-check"> Practiqué el reto y puedo hacerlo lentamente con control.</label><label><input type="checkbox" id="understand-check"> Puedo explicar la idea principal con mis palabras.</label></div><div class="lesson-actions"><button class="text-button" id="lesson-back">← Volver</button><button class="dark-button" id="complete-lesson" disabled>Completar lección ✓</button></div>`;
    const checks = () =>
      ($("#complete-lesson").disabled =
        !$("#challenge-check").checked || !$("#understand-check").checked);
    $("#challenge-check").onchange = checks;
    $("#understand-check").onchange = checks;
    $("#complete-lesson").onclick = () => {
      if (!lessonExercisePassed || !quizPassed) return;
      state.completed = [...new Set([...state.completed, lesson.id])];
      state.practiceChecks[lesson.id] = true;
      save();
      const next = lessons[lessons.indexOf(lesson) + 1];
      content.innerHTML = `<div class="completion"><div class="seal">✓</div><span class="eyebrow">UN PASO MÁS EN TU CAMINO</span><h3>Esta música ya es un poco tuya.</h3><p>Completaste “${lesson.title}”. Volvé a practicarla cuando quieras.</p><div class="controls" style="justify-content:center"><button class="secondary" id="finish-close">Volver a mi espacio</button>${next ? `<button class="dark-button" id="next-lesson">Siguiente lección →</button>` : ""}</div></div>`;
      $("#finish-close").onclick = () => dialog.close();
      if (next)
        $("#next-lesson").onclick = () => {
          lesson = next;
          lessonStep = 0;
          quizPassed = false;
          lessonExercisePassed = false;
          renderLesson();
        };
    };
  }
  const next = $("#lesson-next");
  if (next)
    next.onclick = () => {
      lessonStep++;
      renderLesson();
      dialog.scrollTop = 0;
    };
  const back = $("#lesson-back");
  if (back)
    back.onclick = () => {
      lessonStep--;
      if (lessonStep < 2) quizPassed = false;
      renderLesson();
      dialog.scrollTop = 0;
    };
}
dialog.addEventListener("close", () => {
  if (dialog.open) return;
  cleanup();
  render();
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    )
      dialog.close();
  }
});
$(".skip").onclick = (e) => {
  e.preventDefault();
  $("#main").focus();
};
navigate(location.hash.slice(1) || "home");
if (!state.instrument.configured) configureInstrument();
if (!storageOk)
  toast(
    "No se pudo recuperar el progreso guardado. Revisá tus copias en Ajustes.",
  );
