import { pitchName } from "./guided-score.js";
const progressions = {
  ballad: {
    name: "Balada · I–vi–IV–V",
    chords: [
      [0, 4, 7],
      [9, 12, 16],
      [5, 9, 12],
      [7, 11, 14],
    ],
    labels: ["I", "vi", "IV", "V"],
    roots: [0, 9, 5, 7],
    bars: 8,
  },
  blues: {
    name: "Blues de doce compases",
    chords: [
      [0, 4, 7, 10],
      [0, 4, 7, 10],
      [0, 4, 7, 10],
      [0, 4, 7, 10],
      [5, 9, 12, 15],
      [5, 9, 12, 15],
      [0, 4, 7, 10],
      [0, 4, 7, 10],
      [7, 11, 14, 17],
      [5, 9, 12, 15],
      [0, 4, 7, 10],
      [7, 11, 14, 17],
    ],
    labels: [
      "I7",
      "I7",
      "I7",
      "I7",
      "IV7",
      "IV7",
      "I7",
      "I7",
      "V7",
      "IV7",
      "I7",
      "V7",
    ],
    roots: [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7],
    bars: 12,
  },
  jazz: {
    name: "Jazz · ii–V–I",
    chords: [
      [2, 5, 9, 12],
      [7, 11, 14, 17],
      [0, 4, 7, 11],
      [0, 4, 7, 11],
    ],
    labels: ["ii7", "V7", "Imaj7", "Imaj7"],
    roots: [2, 7, 0, 0],
    bars: 8,
  },
};
export function analyzeImprovisation(
  notes,
  { bars, bpm, root = 60, style = "ballad", durationMs },
) {
  const totalMs = Math.max(1, durationMs ?? (bars * 4 * 60000) / bpm),
    intervals = notes
      .map((n) => [n.start, Math.min(totalMs, n.start + n.duration)])
      .sort((a, b) => a[0] - b[0]);
  let covered = 0,
    end = 0;
  for (const [a, b] of intervals) {
    covered += Math.max(0, b - Math.max(end, a));
    end = Math.max(end, b);
  }
  const unique = new Set(notes.map((n) => n.pitch)).size;
  const motifs = new Map();
  for (let i = 0; i < notes.length - 2; i++) {
    const key = [
      notes[i + 1].pitch - notes[i].pitch,
      notes[i + 2].pitch - notes[i + 1].pitch,
    ].join(":");
    motifs.set(key, (motifs.get(key) || 0) + 1);
  }
  const p = progressions[style] || progressions.ballad,
    entries = new Map();
  for (const n of notes) {
    const beat = (n.start * bpm) / 60000,
      bar = Math.floor(beat / 4);
    if (!entries.has(bar)) entries.set(bar, n);
  }
  let chordEntries = 0;
  for (const [bar, n] of entries) {
    const chord = p.chords[bar % p.chords.length];
    if (chord.some((v) => (v + root) % 12 === n.pitch % 12)) chordEntries++;
  }
  return {
    notes: notes.length,
    unique,
    rests: Math.round(Math.max(0, 1 - covered / totalMs) * 100),
    repeatedMotifs: [...motifs.values()].filter((n) => n > 1).length,
    chordEntries,
    entries: entries.size,
    bars,
    bpm,
  };
}
const vlq = (n) => {
  const a = [n & 127];
  while ((n >>= 7)) a.unshift((n & 127) | 128);
  return a;
};
export function exportPerformanceMIDI(notes, bpm = 60) {
  const ppq = 480,
    events = notes
      .flatMap((n) => [
        {
          tick: Math.round((n.start * bpm * ppq) / 60000),
          bytes: [
            144,
            n.pitch,
            Math.max(1, Math.min(127, Math.round((n.velocity || 0.7) * 127))),
          ],
        },
        {
          tick: Math.round(((n.start + n.duration) * bpm * ppq) / 60000),
          bytes: [128, n.pitch, 0],
        },
      ])
      .sort((a, b) => a.tick - b.tick || a.bytes[0] - b.bytes[0]);
  const us = Math.round(60_000_000 / bpm),
    data = [
      0,
      255,
      81,
      3,
      (us >> 16) & 255,
      (us >> 8) & 255,
      us & 255,
      0,
      255,
      88,
      4,
      4,
      2,
      24,
      8,
    ];
  let previous = 0;
  for (const event of events) {
    data.push(...vlq(Math.max(0, event.tick - previous)), ...event.bytes);
    previous = event.tick;
  }
  data.push(0, 255, 47, 0);
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
  ]);
}
export class ImprovisationLab {
  constructor(root, options) {
    this.root = root;
    this.options = options;
    this.running = false;
    this.notes = [];
    this.held = new Map();
    this.sounding = new Map();
    this.build();
  }
  build() {
    this.root.innerHTML = `<div class="lab-heading"><div><span class="eyebrow">TU LABORATORIO CREATIVO</span><h2>Menos notas. Más intención.</h2><p>Inventá una pregunta y respondela. El acompañamiento sostiene la forma; vos elegís qué decir.</p></div><span class="lab-badge">Crear · escuchar · volver a intentar</span></div><div class="improv-controls"><label>Un paisaje<select id="improv-style">${Object.entries(
      progressions,
    )
      .map(([id, p]) => `<option value="${id}">${p.name}</option>`)
      .join("")}</select></label><label>Tonalidad<select id="improv-root">${[
      [60, "Do"],
      [62, "Re"],
      [65, "Fa"],
      [67, "Sol"],
    ]
      .map(([v, l]) => `<option value="${v}">${l}</option>`)
      .join(
        "",
      )}</select></label><label>Tempo de negra<input id="improv-bpm" type="number" min="40" max="120" step="5" value="65"></label><label>Acompañamiento<select id="improv-backing"><option value="on">Automático · practicá la melodía</option><option value="off">Sin guía · tocá las dos manos</option></select></label></div><div class="improv-map" aria-label="Forma y acordes"></div><div class="improv-prompt"><span data-improv-phase>Tu primera consigna</span><strong data-improv-task>Usá dos notas y dejá un silencio entre las frases.</strong><small>La paleta resaltada es una sugerencia. Una nota cromática puede ser una decisión musical.</small></div><div class="controls"><button class="dark-button" data-improv-start>Grabar una toma →</button><button class="secondary" data-improv-stop disabled>Terminar toma</button><span class="hint" data-improv-position>4 clics de entrada · 8 compases</span></div><div class="improv-piano"></div><div class="improv-results" hidden></div><p class="hint">Se graban mensajes MIDI de tu ejecución, sin micrófono ni envío a internet. La devolución describe ritmo, silencios y motivos; no pone una nota a tu creatividad. Para trabajar expresión, escuchá tu interpretación y elegí una cosa para cambiar.</p>`;
    const $ = (s) => this.root.querySelector(s);
    this.$ = $;
    this.root.querySelectorAll("select,input").forEach(
      (el) =>
        (el.onchange = () => {
          this.stop(false);
          this.renderPalette();
        }),
    );
    $("[data-improv-start]").onclick = () => this.start();
    $("[data-improv-stop]").onclick = () => this.stop(true);
    this.renderPalette();
  }
  get settings() {
    return {
      style: this.$("#improv-style").value,
      root: Number(this.$("#improv-root").value),
      bpm: Math.max(
        40,
        Math.min(120, Number(this.$("#improv-bpm").value) || 65),
      ),
      backing: this.$("#improv-backing").value === "on",
    };
  }
  renderPalette() {
    const s = this.settings,
      p = progressions[s.style];
    this.$(".improv-map").innerHTML = Array.from(
      { length: p.bars },
      (_, i) =>
        `<span data-improv-bar="${i}"><small>${i + 1}</small><strong>${p.labels[i % p.labels.length]}</strong><em>${pitchName(s.root + p.roots[i % p.roots.length]).replace(/\d$/, "")}</em></span>`,
    ).join("");
    this.$("[data-improv-position]").textContent =
      `4 clics de entrada · ${p.bars} compases`;
    this.$(".improv-piano").innerHTML = this.options.pianoHTML([
      48, 60, 72, 79,
    ]);
    this.options.bindPiano(this.$(".improv-piano"));
    const palette = [0, 2, 4, 7, 9];
    this.root
      .querySelectorAll(".key")
      .forEach((k) =>
        k.classList.toggle(
          "target",
          palette.includes((Number(k.dataset.note) - s.root + 120) % 12),
        ),
      );
  }
  start() {
    if (this.running) return;
    this.options.audioReady();
    this.notes = [];
    this.held.clear();
    this.s = this.settings;
    this.p = progressions[this.s.style];
    this.period = 60000 / this.s.bpm;
    this.started = performance.now() + 4 * this.period;
    this.lastBeat = -5;
    this.running = true;
    this.$(".improv-results").hidden = true;
    this.$("[data-improv-start]").disabled = true;
    this.$("[data-improv-stop]").disabled = false;
    this.root
      .querySelectorAll("select,input")
      .forEach((el) => (el.disabled = true));
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }
  tick(now) {
    if (!this.running) return;
    const beat = (now - this.started) / this.period,
      integer = Math.floor(beat),
      bar = Math.floor(Math.max(0, beat) / 4);
    for (const [key, until] of this.sounding)
      if (beat >= until) {
        this.options.soundOff(key);
        this.sounding.delete(key);
      }
    if (integer !== this.lastBeat) {
      this.lastBeat = integer;
      this.options.click(integer % 4 === 0);
      if (beat >= 0 && this.s.backing && bar < this.p.bars) {
        const index = bar % this.p.chords.length,
          chord = this.p.chords[index],
          base = this.s.root - 24;
        if (integer % 4 === 0)
          this.sound(base + this.p.roots[index], beat, 1.8, 0.3);
        if (integer % 2 === 0)
          chord
            .slice(1)
            .forEach((n) => this.sound(base + n + 12, beat, 0.75, 0.2));
      }
    }
    this.root
      .querySelectorAll("[data-improv-bar]")
      .forEach((el) =>
        el.classList.toggle(
          "active",
          Number(el.dataset.improvBar) === bar && beat >= 0,
        ),
      );
    this.$("[data-improv-position]").textContent =
      beat < 0
        ? `Preparación ${Math.min(4, Math.floor(beat + 4) + 1)} / 4`
        : `Compás ${Math.min(this.p.bars, bar + 1)} / ${this.p.bars} · pulso ${Math.floor(beat % 4) + 1}`;
    this.$("[data-improv-phase]").textContent =
      bar < 4 ? "Pregunta" : "Respuesta";
    this.$("[data-improv-task]").textContent =
      bar < 4
        ? "Un motivo corto. Dejá espacio para escucharlo."
        : "Repetí una parte del motivo y cambiá su final.";
    if (beat >= this.p.bars * 4) {
      this.stop(true);
      return;
    }
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }
  sound(pitch, beat, duration, velocity) {
    const key = `improv:${pitch}`;
    this.options.soundOn(pitch, key, velocity);
    this.sounding.set(key, beat + duration);
  }
  noteOn(pitch, velocity = 0.7) {
    if (
      !this.running ||
      performance.now() < this.started ||
      this.held.has(pitch)
    )
      return;
    this.held.set(pitch, {
      pitch,
      start: performance.now() - this.started,
      velocity,
    });
  }
  noteOff(pitch) {
    const n = this.held.get(pitch);
    if (!n) return;
    this.held.delete(pitch);
    this.notes.push({
      ...n,
      duration: Math.max(1, performance.now() - this.started - n.start),
    });
  }
  stop(report = false) {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.frame);
    for (const pitch of this.held.keys()) this.noteOff(pitch);
    for (const key of this.sounding.keys()) this.options.soundOff(key);
    this.sounding.clear();
    this.root
      .querySelectorAll("select,input")
      .forEach((el) => (el.disabled = false));
    this.$("[data-improv-start]").disabled = false;
    this.$("[data-improv-stop]").disabled = true;
    if (!report) return;
    const notes = [...this.notes].sort((a, b) => a.start - b.start);
    const result = analyzeImprovisation(notes, {
      ...this.s,
      bars: this.p.bars,
      durationMs: Math.max(
        1,
        Math.min(
          this.p.bars * 4 * this.period,
          performance.now() - this.started,
        ),
      ),
    });
    const panel = this.$(".improv-results");
    panel.hidden = false;
    panel.innerHTML = `<span class="eyebrow">ESCUCHÁ TUS DECISIONES</span><h3>Una toma, nuevas ideas.</h3><div class="improv-metrics"><span><strong>${result.notes}</strong>notas tocadas</span><span><strong>${result.unique}</strong>alturas distintas</span><span><strong>${result.rests}%</strong>espacio sin notas</span><span><strong>${result.repeatedMotifs}</strong>motivos repetidos</span></div><p>${result.notes ? "¿Podés cantar tu motivo? Probá otra toma con menos notas y un final diferente." : "La toma no registró notas. Revisá la conexión o usá el teclado virtual; empezá después de los cuatro clics."}</p><p class="hint">${result.chordEntries} de ${result.entries} primeras notas de compás coincidieron con el acorde del acompañamiento. Es una descripción, no una regla para todas las melodías.</p><button class="secondary" data-improv-export ${notes.length ? "" : "disabled"}>Guardar mi toma MIDI ↓</button>`;
    this.options.onResult({ ...result, date: Date.now() });
    panel.querySelector("[data-improv-export]").onclick = () => {
      const data = exportPerformanceMIDI(notes, this.s.bpm),
        url = URL.createObjectURL(new Blob([data], { type: "audio/midi" })),
        a = document.createElement("a");
      a.href = url;
      a.download = "clavia-mi-improvisacion.mid";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }
  dispose() {
    this.stop(false);
    cancelAnimationFrame(this.frame);
    this.root.innerHTML = "";
  }
}
