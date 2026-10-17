import { escapeHTML as esc } from "./repertoire.js";
import {
  pitchName,
  durationName,
  PracticeSession,
  selectPassage,
  validateGuided,
} from "./guided-score.js";
const $ = (s, r) => r.querySelector(s),
  $$ = (s, r) => [...r.querySelectorAll(s)];
const letters = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const natural = [0, 2, 4, 5, 7, 9, 11];
function spelling(note) {
  const text = note.label || pitchName(note.pitch);
  const m = /^(Do|Re|Mi|Fa|Sol|La|Si)([♯♭]*)(-?\d+)$/.exec(text);
  return m
    ? {
        diatonic: (Number(m[3]) + 1) * 7 + letters.indexOf(m[1]),
        accidental: m[2],
        name: text,
      }
    : {
        diatonic:
          Math.floor(note.pitch / 12) * 7 + natural.indexOf(note.pitch % 12),
        accidental: "",
        name: text,
      };
}
function restSymbol(x, y, duration) {
  if (duration === 4 || duration === 2)
    return `<rect x="${x - 5}" y="${duration === 4 ? y - 42 : y - 34}" width="11" height="5" fill="currentColor"/>`;
  if (duration <= 0.5)
    return `<path d="M${x + 4} ${y - 43}l-8 23m8-23c-9 13-15 0-6-1" fill="none" stroke="currentColor" stroke-width="2.5"/>`;
  return `<path d="m${x - 3} ${y - 49} 7 9-7 9 7 9c-10-6-11 3-5 7" fill="none" stroke="currentColor" stroke-width="3"/>`;
}
/** La notación y el evaluador comparten alturas y reloj, con una rejilla de 1/24 de negra. */
export function notationParts(score) {
  return score.notes.flatMap((n) => {
    let tick = Math.round(n.start * 24),
      remaining = Math.round(n.duration * 24);
    const parts = [];
    const tuplet = n.tuplet === 3 || remaining % 3 !== 0;
    const values = tuplet
      ? [64, 32, 16, 8, 4, 2, 1]
      : [96, 72, 48, 36, 24, 18, 12, 9, 6, 3, 2, 1];
    while (remaining > 0) {
      const room =
        Math.round(score.meter * 24) - (tick % Math.round(score.meter * 24));
      const ticks = values.find((d) => d <= remaining && d <= room);
      if (!ticks) throw Error("No se pudo representar la duración.");
      const duration = ticks / 24,
        display = tuplet ? duration * 1.5 : duration;
      const dotted = [3, 1.5, 0.75, 0.375].includes(display),
        base = dotted ? display / 1.5 : display;
      parts.push({
        ...n,
        start: tick / 24,
        duration,
        displayDuration: base,
        dotted,
        tuplet: tuplet ? 3 : undefined,
        continuation: tick > Math.round(n.start * 24),
        tied: remaining > ticks,
      });
      tick += ticks;
      remaining -= ticks;
    }
    return parts;
  });
}
export function scoreSVG(score, aid = "full") {
  const hands = ["right", "left"].filter((h) =>
    score.notes.some((n) => n.hand === h),
  );
  if (!hands.length)
    return '<p class="empty">Este pasaje no tiene notas para la mano elegida. Elegí ambas manos u otro pasaje.</p>';
  const notes = notationParts(score),
    meter = score.meter,
    signature = score.timeSignature || `${meter}/4`,
    [numerator, denominator] = signature.split("/"),
    barWidth = Math.max(225, meter * 53 + 30),
    beatWidth = (barWidth - 32) / meter,
    width = 110 + score.bars * barWidth;
  const groups = new Map();
  for (const n of notes) {
    const key = `${n.hand}:${n.start}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(n);
  }
  for (const group of groups.values()) group.sort((a, b) => a.pitch - b.pitch);
  const maxChord = Math.min(
      6,
      Math.max(...[...groups.values()].map((g) => g.length)),
    ),
    rowGap = 158 + Math.max(0, maxChord - 3) * 12,
    height = hands.length === 2 ? rowGap + 185 : 185,
    yFor = (h) => 134 + hands.indexOf(h) * rowGap,
    xFor = (start) =>
      127 +
      Math.floor((start + 1e-7) / meter) * barWidth +
      (start % meter) * beatWidth;
  let body = "";
  for (const hand of hands) {
    const y = yFor(hand),
      bass = hand === "left";
    body += `<g class="staff-lines">${[0, 1, 2, 3, 4].map((i) => `<line x1="20" x2="${width - 15}" y1="${y - i * 14}" y2="${y - i * 14}"/>`).join("")}</g><text x="25" y="${bass ? y - 12 : y + 7}" class="score-clef">${bass ? "𝄢" : "𝄞"}</text><text x="72" y="${y - 31}" class="time-signature">${numerator}</text><text x="72" y="${y - 7}" class="time-signature">${denominator}</text><text x="22" y="${y + 42}" class="score-hand">${bass ? "IZQUIERDA" : "DERECHA"}</text>`;
    for (let bar = 0; bar < score.bars; bar++) {
      const x = 105 + bar * barWidth;
      body += `<line class="score-barline" x1="${x + barWidth}" x2="${x + barWidth}" y1="${y - 56}" y2="${y}"/>`;
      if (hand === hands[0])
        body += `<text x="${x + 15}" y="${y - 78}" class="measure-label">COMPÁS ${(score.sourceBar || 1) + bar}</text>`;
      const start = bar * meter,
        end = start + meter,
        intervals = notes
          .filter(
            (n) =>
              n.hand === hand && n.start < end && n.start + n.duration > start,
          )
          .map((n) => [
            Math.max(start, n.start),
            Math.min(end, n.start + n.duration),
          ])
          .sort((a, b) => a[0] - b[0]);
      let cursor = start;
      const gaps = [];
      for (const [a, b] of intervals) {
        if (a > cursor + 1e-6) gaps.push([cursor, a]);
        cursor = Math.max(cursor, b);
      }
      if (cursor < end - 1e-6) gaps.push([cursor, end]);
      for (const [a, b] of gaps)
        for (const r of notationParts({
          meter,
          notes: [{ start: a, duration: b - a, hand, pitch: 60, id: "rest" }],
        })) {
          const rx = xFor(r.start),
            symbol = restSymbol(rx, y, r.displayDuration);
          body += `<g class="score-rest" role="img" aria-label="Silencio de ${Number(r.duration.toFixed(3))} negras">${symbol}${r.dotted ? `<circle cx="${rx + 12}" cy="${y - 32}" r="2.5"/>` : ""}${r.tuplet ? `<text x="${rx}" y="${y - 58}" text-anchor="middle" font-size="10">3</text>` : ""}${aid !== "score" ? `<text x="${rx}" y="${y + 25}" text-anchor="middle" class="rest-name">silencio</text>` : ""}</g>`;
        }
    }
  }
  const alterations = new Map();
  for (const n of notes) {
    const s = spelling(n),
      y = yFor(n.hand),
      step = s.diatonic - (n.hand === "left" ? 25 : 37),
      cy = y - step * 7,
      x = xFor(n.start),
      down = step >= 4,
      stemX = x + (down ? -8 : 8),
      stemEnd = cy + (down ? 34 : -34),
      group = groups.get(`${n.hand}:${n.start}`),
      labelRow = group.indexOf(n),
      base = n.displayDuration;
    const accidentalKey = `${n.hand}:${Math.floor(n.start / meter)}:${s.diatonic}`;
    const previous = alterations.get(accidentalKey) || "";
    let accidental = s.accidental;
    if (!accidental && previous) accidental = "♮";
    alterations.set(accidentalKey, s.accidental);
    let ledger = "";
    for (let i = -2; i >= step; i -= 2)
      ledger += `<line x1="${x - 14}" x2="${x + 14}" y1="${y - i * 7}" y2="${y - i * 7}"/>`;
    for (let i = 10; i <= step; i += 2)
      ledger += `<line x1="${x - 14}" x2="${x + 14}" y1="${y - i * 7}" y2="${y - i * 7}"/>`;
    const flags = base <= 0.125 ? 3 : base <= 0.25 ? 2 : base <= 0.5 ? 1 : 0;
    body += `<g class="score-note ${n.hand}" data-score-note="${esc(n.id)}" data-score-start="${n.start}" data-score-duration="${n.duration}" data-pitch="${n.pitch}" role="button" tabindex="0" aria-label="${esc(s.name)}, ${durationName(n.duration)}${n.finger ? ", dedo " + n.finger : ""}. Escuchar esta nota"><rect class="score-note-focus" x="${x - 17}" y="${Math.min(y - 62, cy - 22)}" width="34" height="${Math.max(92, y - cy + 50)}" rx="7"/><g class="score-ledger">${ledger}</g>${accidental ? `<text x="${x - 24}" y="${cy + 6}" class="score-accidental">${accidental}</text>` : ""}<ellipse class="score-head ${base >= 2 ? "open" : ""}" cx="${x}" cy="${cy}" rx="${base >= 4 ? 11 : 8}" ry="5.5" transform="rotate(-15 ${x} ${cy})"/>${base < 4 ? `<line class="score-stem" x1="${stemX}" x2="${stemX}" y1="${cy}" y2="${stemEnd}"/>` : ""}${Array.from({ length: flags }, (_, i) => `<path class="score-flag" d="M${stemX} ${stemEnd + (down ? -1 : 1) * i * 7}q${down ? -13 : 13} ${down ? -9 : 9} 2 ${down ? -23 : 23}"/>`).join("")}${n.dotted ? `<circle class="score-dot" cx="${x + 15}" cy="${cy - 3}" r="2.5"/>` : ""}${n.tuplet ? `<text class="score-tuplet" x="${x + 8}" y="${cy - 48}" text-anchor="middle" font-size="12">3</text>` : ""}${n.continuation ? `<path class="score-tie" d="M${x - 17} ${cy + 13}q10 12 22 0" fill="none" stroke="currentColor" stroke-width="1.5"><title>Ligadura: mantener sin volver a atacar</title></path>` : ""}${n.tied ? `<path class="score-tie" d="M${x + 3} ${cy + 13}q12 12 25 0" fill="none" stroke="currentColor" stroke-width="1.5"/>` : ""}${aid === "full" && n.finger ? `<text class="score-finger" x="${x}" y="${cy - 45}" text-anchor="middle">${n.finger}</text>` : ""}${aid !== "score" && labelRow < 6 ? `<text class="score-name" x="${x}" y="${y + 23 + labelRow * 12 + (n.start % 1 ? 6 : 0)}" text-anchor="middle">${esc(s.name)}</text>` : ""}</g>`;
  }
  return `<svg class="guided-score" viewBox="0 25 ${width} ${height - 25}" width="${width}" height="${height}" role="group" aria-label="Partitura de ${esc(score.title)}. Compás de ${numerator} por ${denominator === "4" ? "cuatro" : "ocho"}. Verde: derecha; azul: izquierda.">${body}</svg>`;
}

function keyboardMap(size = 61, first = 36) {
  const last = first + size - 1;
  let white = 0;
  const list = Array.from({ length: size }, (_, i) => first + i);
  const count = list.filter((n) => natural.includes(n % 12)).length;
  return `<svg viewBox="0 0 ${count * 14} 42" class="keyboard-map" role="img" aria-label="Mapa de tu teclado de ${size} teclas. El Do central es Do4.">${list
    .map((n) => {
      const black = !natural.includes(n % 12),
        x = white * 14;
      if (!black) white++;
      return `<rect data-map-pitch="${n}" class="map-key ${black ? "map-black" : ""} ${n === 60 ? "map-middle" : ""}" x="${black ? x - 4 : x}" y="0" width="${black ? 8 : 13}" height="${black ? 23 : 38}" rx="1"/>`;
    })
    .join(
      "",
    )}<text x="${list.filter((n) => n < 60 && natural.includes(n % 12)).length * 14 + 6}" y="34" text-anchor="middle" font-size="6" fill="#294e42">Do4</text></svg>`;
}
const errorText = (e) =>
  ({
    pitch: `Nota equivocada: ${pitchName(e.actual)}; era ${e.expected !== undefined ? pitchName(e.expected) : "un silencio"}.`,
    octave: `Octava equivocada: ${pitchName(e.actual)}; era ${pitchName(e.expected)}.`,
    short: `${pitchName(e.expected)} terminó antes de tiempo.`,
    long: `${pitchName(e.expected)} quedó sostenida de más.`,
    together: "El acorde no sonó completo al mismo tiempo.",
    missed: `Faltó tocar ${pitchName(e.expected)}.`,
  })[e.type];
export class GuidedPractice {
  constructor(root, score, options) {
    this.root = root;
    this.fullScore = score;
    this.options = options;
    this.prefs = validateGuided(options.preferences);
    this.from = 1;
    this.to = score.bars;
    this.running = false;
    this.position = 0;
    this.origin = 0;
    this.frame = null;
    this.focusFrame = null;
    this.disposed = false;
    this.sounding = new Set();
    this.session = null;
    this.reported = false;
    this.lastText = "";
    this.inputKeys = new Set();
    this.build();
  }
  setFocus(value) {
    this.focused = value;
    this.root.classList.toggle("coach-focus", value);
    document.body.classList.toggle("coach-focus-open", value);
    const button = $("[data-coach-focus]", this.root);
    if (button)
      button.textContent = value ? "Salir del atril ↙" : "Abrir modo atril ↗";
    cancelAnimationFrame(this.focusFrame);
    if (!this.disposed)
      this.focusFrame = requestAnimationFrame(() => {
        if (!this.disposed) this.updateVisuals();
      });
  }
  persist() {
    this.options.onPreferences({ ...this.prefs });
  }
  get score() {
    const key = `${this.from}:${this.to}:${this.prefs.hand}`;
    if (this.cachedKey !== key) {
      this.cachedKey = key;
      this.cachedScore = selectPassage(
        this.fullScore,
        this.from,
        this.to,
        this.prefs.hand,
      );
    }
    return this.cachedScore;
  }
  build() {
    this.stop();
    this.options.releaseInput();
    const root = this.root;
    const settingsOpen = $(".coach-settings", root)?.open || false;
    const mismatch =
      this.options.instrument &&
      this.options.instrument.connection !== "virtual"
        ? this.fullScore.notes.filter(
            (n) =>
              n.pitch < this.options.instrument.firstNote ||
              n.pitch >=
                this.options.instrument.firstNote +
                  this.options.instrument.keys,
          ).length
        : 0;
    const hasLeft = this.fullScore.notes.some((n) => n.hand === "left"),
      hasRight = this.fullScore.notes.some((n) => n.hand === "right");
    if (
      (this.prefs.hand === "left" && !hasLeft) ||
      (this.prefs.hand === "right" && !hasRight)
    )
      this.prefs.hand = "both";
    root.classList.add("guided-practice");
    root.innerHTML = `<div class="coach-heading"><div><span class="eyebrow">TU PRÁCTICA VISUAL · ${this.options.instrument?.model ? esc(this.options.instrument.model) + " · " : ""}${this.prefs.keyboard} TECLAS</span><h3>${esc(this.fullScore.title)}</h3><p>${esc(this.fullScore.description)}</p></div><div class="coach-top-actions"><button class="secondary" data-coach-focus>Abrir modo atril ↗</button><button class="text-button coach-adjust" data-coach-adjust>Ajustar práctica</button></div></div>${mismatch ? `<p class="range-warning">${mismatch} notas están fuera del registro de tu teclado. Podés escuchar el ejemplo; para tocarlo completo, revisá el instrumento o elegí una adaptación.</p>` : ""}<div class="coach-modes" aria-label="Forma de practicar">${[
      ["preview", "1. Ver y escuchar"],
      ["step", "2. A mi ritmo"],
      ["timed", "3. Con pulso"],
    ]
      .map(
        ([value, label]) =>
          `<button data-coach-mode="${value}" aria-pressed="${value === this.prefs.mode}" class="${value === this.prefs.mode ? "selected" : ""}">${label}</button>`,
      )
      .join(
        "",
      )}</div><details class="coach-settings"><summary>Personalizar velocidad, ayudas y compases <span>${this.prefs.bpm} BPM · ${this.prefs.aid === "score" ? "sin nombres" : "con ayuda"}</span></summary><div class="coach-controls"><label for="coach-bpm">Velocidad <strong data-coach-tempo>${this.prefs.bpm} BPM</strong><input id="coach-bpm" type="range" min="30" max="140" step="5" value="${this.prefs.bpm}"></label><label for="coach-aid">Ayuda para leer<select id="coach-aid"><option value="full">Notas + dedos indicados</option><option value="names">Nombres de las notas</option><option value="score">Solo partitura</option></select></label><label for="coach-hand">Manos<select id="coach-hand"><option value="both">${hasLeft && hasRight ? "Las dos manos" : "Mano de este ejercicio"}</option>${hasRight ? '<option value="right">Solo derecha</option>' : ""}${hasLeft ? '<option value="left">Solo izquierda</option>' : ""}</select></label></div><div class="coach-passage"><span>Practicar compases</span><label>Desde <select id="coach-from">${Array.from({ length: this.fullScore.bars }, (_, i) => `<option>${i + 1}</option>`).join("")}</select></label><label>Hasta <select id="coach-to">${Array.from({ length: this.fullScore.bars }, (_, i) => `<option>${i + 1}</option>`).join("")}</select></label><label class="coach-loop"><input type="checkbox" id="coach-loop" ${this.prefs.loop ? "checked" : ""}> Repetir pasaje</label></div></details><section class="score-paper" aria-label="Tu partitura"><div class="score-paper-title"><span>LO QUE LEÉS</span><div><span class="hand-legend right">Derecha</span><span class="hand-legend left">Izquierda</span></div></div><div class="score-scroll" tabindex="0" aria-label="Partitura, desplazable horizontalmente">${scoreSVG(this.score, this.prefs.aid)}</div><div class="score-explainer"><span>♩ = 1 pulso</span><span>𝅗𝅥 = 2 pulsos</span><span>𝅝 = 4 pulsos</span><span>♪ = ½ pulso</span></div></section><div class="coach-transport"><button class="dark-button" data-coach-play>Reproducir guía</button><button class="secondary" data-coach-reset aria-label="Volver al inicio del ejercicio">↺ Desde el inicio</button><div class="coach-count" aria-live="off">Listo para empezar</div></div><div class="coach-instruction" role="status" aria-live="polite">${this.modeHint()}</div><section class="coach-instrument"><div class="score-paper-title"><span>LO QUE TOCÁS</span><span class="coach-input">Mouse, computadora o MIDI</span></div><div class="coach-keyboard"></div><div class="coach-map"><span>UBICACIÓN EN TU TECLADO <small>Do4 = Do central</small></span>${keyboardMap(this.prefs.keyboard, this.prefs.firstNote)}</div></section><div class="coach-duration">${[
      "right",
      "left",
    ]
      .filter((hand) => this.score.notes.some((n) => n.hand === hand))
      .map(
        (hand) =>
          `<div class="duration-hand ${hand}" data-duration-hand="${hand}"><div><span data-duration-label></span><strong data-duration-value>—</strong></div><div class="coach-duration-track"><span></span></div></div>`,
      )
      .join(
        "",
      )}</div><div class="coach-results" hidden></div><details class="coach-help"><summary>Estoy aprendiendo a leer: ¿cómo sigo esto?</summary><ol><li>Arriba, la altura de la nota indica qué tecla tocar. El nombre debajo te ayuda a encontrarla.</li><li>El número sobre una nota es el dedo sugerido: 1 pulgar, 2 índice, 3 medio, 4 anular y 5 meñique. Solo aparece donde hay digitación escrita.</li><li>La figura indica la duración. A ${this.prefs.bpm} BPM, un pulso dura ${(60 / this.prefs.bpm).toFixed(2)} segundos.</li><li>Las barras bajan hacia las teclas. Cuando una barra llega a la línea, empieza la nota. Mantené la tecla mientras la barra siga llegando.</li><li>En “A mi ritmo”, la partitura te espera. La barra de duración se llena mientras sostenés la tecla. Soltala al completarse para avanzar.</li><li>En “Con pulso”, contá los cuatro clics de entrada. Se comprueban las notas, los ataques y cuánto sostenés cada tecla. La tolerancia inicial es amplia.</li></ol><p>Las teclas negras pueden tener dos nombres: Re♯ y Mi♭, por ejemplo, son la misma tecla. MIDI no indica qué dedo usaste.</p><label>Tu instrumento <select id="coach-keyboard-size">${[25, 32, 37, 49, 61, 73, 76, 88].map((n) => `<option value="${n}">${n} teclas</option>`).join("")}</select></label></details>`;
    $(".coach-settings", root).open = settingsOpen;
    $("[data-coach-focus]", root).onclick = () => this.setFocus(!this.focused);
    $("[data-coach-adjust]", root).onclick = () => {
      this.setFocus(false);
      $(".coach-settings", root).open = true;
      $(".coach-settings", root).scrollIntoView({ block: "center" });
    };
    root.onkeydown = (e) => {
      if (e.key === "Escape" && this.focused) {
        e.preventDefault();
        e.stopPropagation();
        this.setFocus(false);
      }
    };
    if (this.focused) this.setFocus(true);
    $("#coach-aid", root).value = this.prefs.aid;
    $("#coach-hand", root).value = this.prefs.hand;
    $("#coach-from", root).value = this.from;
    $("#coach-to", root).value = this.to;
    $("#coach-keyboard-size", root).value = this.prefs.keyboard;
    $$("[data-coach-mode]", root).forEach(
      (b) =>
        (b.onclick = () => {
          this.prefs.mode = b.dataset.coachMode;
          this.position = 0;
          this.persist();
          this.build();
        }),
    );
    $("#coach-bpm", root).oninput = (e) => {
      this.stop();
      this.prefs.bpm = Number(e.target.value);
      $("[data-coach-tempo]", root).textContent = `${this.prefs.bpm} BPM`;
      this.persist();
      this.updateVisuals();
    };
    $("#coach-bpm", root).onchange = () => this.build();
    for (const [selector, key] of [
      ["#coach-aid", "aid"],
      ["#coach-hand", "hand"],
      ["#coach-keyboard-size", "keyboard"],
    ])
      $(selector, root).onchange = (e) => {
        this.prefs[key] =
          key === "keyboard" ? Number(e.target.value) : e.target.value;
        this.position = 0;
        this.persist();
        this.build();
      };
    $("#coach-from", root).onchange = (e) => {
      this.from = Number(e.target.value);
      if (this.to < this.from) this.to = this.from;
      this.position = 0;
      this.build();
    };
    $("#coach-to", root).onchange = (e) => {
      this.to = Number(e.target.value);
      if (this.from > this.to) this.from = this.to;
      this.position = 0;
      this.build();
    };
    $("#coach-loop", root).onchange = (e) => {
      this.prefs.loop = e.target.checked;
      this.persist();
    };
    $("[data-coach-play]", root).onclick = () =>
      this.running ? this.stop() : this.start();
    $("[data-coach-reset]", root).onclick = () => {
      this.position = 0;
      this.build();
    };
    this.renderInstrument();
    $$("[data-score-note]", root).forEach((el) => {
      const show = () => {
        if (this.running) return;
        const n = this.score.notes.find((n) => n.id === el.dataset.scoreNote);
        this.position = n.start;
        this.options.silenceGuides();
        this.options.soundOn(n.pitch, `coach-peek:${n.id}`);
        clearTimeout(this.peekTimer);
        this.peekTimer = setTimeout(
          () => this.options.silenceGuides(),
          (n.duration * 60000) / this.prefs.bpm,
        );
        this.message(
          `${n.label || pitchName(n.pitch)} · ${durationName(n.duration)}${n.finger ? " · dedo " + n.finger : ""}.`,
        );
        this.updateVisuals();
      };
      el.onclick = show;
      el.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          show();
        }
      };
    });
    this.session = null;
    this.reported = false;
    this.lastText = "";
    this.stop();
    this.updateVisuals();
  }
  modeHint() {
    return {
      preview:
        "Primero mirá y escuchá. La guía muestra qué tocar y durante cuánto tiempo. Escuchar no completa el ejercicio.",
      step: "La música te espera: tocá la nota marcada, sostenela hasta llenar la barra y soltala para avanzar. No se evalúa el momento de entrada.",
      timed:
        "Cuatro pulsos de entrada y después tocás vos. Se evalúan notas, momento de entrada y duración. La guía visual sigue visible.",
    }[this.prefs.mode];
  }
  renderInstrument() {
    const root = $(".coach-keyboard", this.root);
    root.innerHTML = this.options.pianoHTML(
      this.score.notes.map((n) => n.pitch),
    );
    this.options.bindPiano(root);
    const scroll = $(".piano-scroll", root),
      piano = $(".piano", root);
    const roll = document.createElement("div");
    roll.className = "coach-roll";
    roll.setAttribute("aria-hidden", "true");
    roll.innerHTML =
      '<div class="roll-strike"><span>TOCÁ ACÁ</span></div>' +
      this.score.notes
        .map(
          (n) =>
            `<div class="falling-note ${n.hand}" data-roll-note="${n.id}"><span>${this.prefs.aid === "score" ? "" : n.label || pitchName(n.pitch)}</span></div>`,
        )
        .join("");
    scroll.insertBefore(roll, piano);
    $$(".key", root).forEach((key) => {
      if (this.prefs.aid === "score") $("span", key).textContent = "";
      key.classList.remove("target");
    });
    this.noteIndex = new Map(this.score.notes.map((n) => [n.id, n]));
    this.roll = roll;
    this.piano = piano;
  }
  message(text, error = false) {
    if (this.lastText === text) return;
    this.lastText = text;
    const el = $(".coach-instruction", this.root);
    el.textContent = text;
    el.classList.toggle("has-error", error);
  }
  start() {
    if (!this.score.notes.length) {
      this.message("Elegí un pasaje que tenga notas para esta mano.", true);
      return;
    }
    this.options.audioReady();
    this.options.silenceGuides();
    clearTimeout(this.peekTimer);
    this.sounding.clear();
    this.inputKeys.clear();
    const resuming =
      this.paused &&
      this.session &&
      !this.reported &&
      this.prefs.mode === "preview";
    if (!resuming) {
      this.position = 0;
      this.session = new PracticeSession(this.score, {
        bpm: this.prefs.bpm,
        mode: this.prefs.mode === "timed" ? "timed" : "step",
      });
      this.reported = false;
      $(".coach-results", this.root).hidden = true;
    }
    this.running = true;
    this.paused = false;
    this.started = performance.now();
    this.origin =
      this.started -
      (this.position * 60000) / this.prefs.bpm +
      (this.prefs.mode === "timed" ? (4 * 60000) / this.prefs.bpm : 0);
    this.lastBeat = -5;
    $("[data-coach-play]", this.root).textContent =
      this.prefs.mode === "preview" ? "Pausar guía" : "Pausar práctica";
    this.message(this.modeHint());
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }
  stop() {
    clearTimeout(this.loopTimer);
    this.running = false;
    this.paused = true;
    cancelAnimationFrame(this.frame);
    clearTimeout(this.peekTimer);
    this.sounding?.clear();
    this.options?.silenceGuides();
    const button = this.root && $("[data-coach-play]", this.root);
    if (button)
      button.textContent =
        this.prefs.mode === "preview"
          ? "Reproducir guía"
          : this.prefs.mode === "step"
            ? "Empezar a mi ritmo"
            : "Tocar con pulso";
  }
  tick(now) {
    if (!this.running) return;
    const period = 60000 / this.prefs.bpm;
    if (this.prefs.mode === "step") {
      this.session.tick(now - this.started);
      this.position = this.session.stepPosition(now - this.started);
      this.syncFeedback();
      if (this.session.done) {
        this.finish();
        return;
      }
    } else {
      this.position = (now - this.origin) / period;
      if (this.prefs.mode === "timed") {
        const beat = Math.floor(this.position);
        if (beat !== this.lastBeat) {
          this.lastBeat = beat;
          this.options.click(beat % this.score.meter === 0);
        }
        if (this.position >= 0) {
          this.session.tick(now - this.origin);
          this.syncFeedback();
        }
      }
    }
    if (this.prefs.mode === "preview") {
      const active = this.score.notes.filter(
        (n) => n.start <= this.position && n.start + n.duration > this.position,
      );
      const next = new Set(active.map((n) => n.id));
      for (const id of this.sounding)
        if (!next.has(id)) this.options.soundOff(`coach:${id}`);
      for (const n of active)
        if (!this.sounding.has(n.id))
          this.options.soundOn(n.pitch, `coach:${n.id}`);
      this.sounding = next;
    }
    this.updateVisuals(now);
    if (
      this.prefs.mode !== "step" &&
      this.position >=
        this.score.bars * this.score.meter +
          (this.prefs.mode === "timed" ? 0.6 + 600 / period : 0)
    ) {
      this.finish();
      return;
    }
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }
  syncFeedback() {
    const last = this.session.errors.at(-1);
    this.message(
      this.session.feedback,
      !!last &&
        this.session.feedback !== this.lastText &&
        ["pitch", "octave", "short", "long", "together"].includes(last.type) &&
        !this.session.feedback.startsWith("Bien"),
    );
  }
  noteOn(pitch, source) {
    if (!this.running || this.prefs.mode === "preview" || this.position < 0)
      return;
    this.inputKeys.add(pitch);
    this.session.on(
      pitch,
      this.prefs.mode === "step"
        ? performance.now() - this.started
        : performance.now() - this.origin,
    );
    $(".coach-input", this.root).textContent = source.startsWith("midi")
      ? "Recibiendo tu teclado MIDI"
      : "Recibiendo teclado virtual";
    this.syncFeedback();
    this.updateVisuals();
  }
  noteOff(pitch) {
    if (!this.running || this.prefs.mode === "preview" || this.position < 0)
      return;
    this.inputKeys.delete(pitch);
    this.session.off(
      pitch,
      this.prefs.mode === "step"
        ? performance.now() - this.started
        : performance.now() - this.origin,
    );
    this.syncFeedback();
    if (this.prefs.mode === "step") this.position = this.session.group;
    this.updateVisuals();
    if (this.prefs.mode === "step" && this.session.done) this.finish();
  }
  updateVisuals(now = performance.now()) {
    const root = this.root;
    if (this.disposed || !this.roll?.isConnected || !this.root.isConnected)
      return;
    const notes = this.score.notes,
      position = Math.max(0, this.position);
    const active = notes.filter((n) =>
      this.prefs.mode === "step" && this.session && this.running
        ? n.start === this.session.group ||
          this.session.held.get(n.pitch)?.note.id === n.id
        : n.start <= position && n.start + n.duration > position,
    );
    const activeIds = new Set(active.map((n) => n.id));
    const width = this.piano.offsetWidth,
      whites = $$(".key:not(.black)", this.piano).length,
      whiteWidth = width / whites,
      height = this.roll.clientHeight,
      pxPerBeat = height / 4;
    $$("[data-roll-note]", root).forEach((el) => {
      const n = this.noteIndex.get(el.dataset.rollNote);
      if (!n) return;
      const visible =
        n.start < this.position + 4.5 &&
        n.start + n.duration > this.position - 0.5;
      if (el.hidden === visible) el.hidden = !visible;
      if (!visible) return;
      const key = $(`.key[data-note="${n.pitch}"]`, this.piano);
      if (!key) return;
      const black = key.classList.contains("black");
      el.style.left = `${black ? parseFloat(key.style.left) : ($$(".key:not(.black)", this.piano).indexOf(key) / whites) * 100}%`;
      el.style.width = `${black ? parseFloat(key.style.width) : (whiteWidth / width) * 100}%`;
      el.style.height = `${n.duration * pxPerBeat}px`;
      el.style.transform = `translateY(${height - (n.start + n.duration - this.position) * pxPerBeat}px)`;
      el.classList.toggle("striking", activeIds.has(n.id));
    });
    $$(".key", this.piano).forEach((key) => {
      const note = active.find((n) => n.pitch === Number(key.dataset.note));
      key.classList.toggle("guide-active", !!note);
      key.classList.toggle("guide-left", note?.hand === "left");
      let finger = $(".guide-finger", key);
      if (note?.finger && this.prefs.aid === "full") {
        if (!finger) {
          finger = document.createElement("b");
          finger.className = "guide-finger";
          key.append(finger);
        }
        finger.textContent = note.finger;
      } else finger?.remove();
    });
    $$("[data-score-note]", root).forEach((el) => {
      const r = this.session?.results.get(el.dataset.scoreNote);
      el.classList.toggle(
        "score-current",
        activeIds.has(el.dataset.scoreNote) &&
          Number(el.dataset.scoreStart) <= position &&
          position <
            Number(el.dataset.scoreStart) + Number(el.dataset.scoreDuration),
      );
      el.classList.toggle("score-done", r?.state === "correct");
      el.classList.toggle(
        "score-error",
        r?.state === "missed" || r?.state === "incorrect",
      );
    });
    $$("[data-map-pitch]", root).forEach((key) =>
      key.classList.toggle(
        "map-active",
        active.some((n) => n.pitch === Number(key.dataset.mapPitch)),
      ),
    );
    $$("[data-duration-hand]", root).forEach((row) => {
      const hand = row.dataset.durationHand;
      const own = active.filter((n) => n.hand === hand);
      const first =
        (this.prefs.mode === "step" && this.session
          ? own.find((n) => n.start === this.session.group)
          : own[0]) ||
        own[0] ||
        notes.find((n) => n.hand === hand && n.start > position);
      const target = first ? (first.duration * 60000) / this.prefs.bpm : 0;
      let elapsed = 0;
      if (first) {
        if (this.prefs.mode === "step" && this.session) {
          const held = this.session.held.get(first.pitch);
          if (held) elapsed = Math.max(0, now - this.started - held.time);
        } else
          elapsed = Math.max(
            0,
            ((position - first.start) * 60000) / this.prefs.bpm,
          );
      }
      const side = hand === "right" ? "Derecha" : "Izquierda";
      const pitches = first
        ? notes
            .filter((n) => n.hand === hand && n.start === first.start)
            .map((n) => n.label || pitchName(n.pitch))
            .join(" + ")
        : "";
      $("[data-duration-label]", row).textContent = first
        ? `${side} · ${this.prefs.aid === "score" ? "nota actual" : pitches} · ${first.duration} ${first.duration === 1 ? "pulso" : "pulsos"}${first.finger && this.prefs.aid === "full" ? " · dedo " + first.finger : ""}`
        : `${side} · pasaje completo`;
      $("[data-duration-value]", row).textContent = first
        ? `${(Math.min(elapsed, target) / 1000).toFixed(1)} / ${(target / 1000).toFixed(1)} s`
        : "—";
      $(".coach-duration-track>span", row).style.width =
        `${target ? Math.min(100, (elapsed / target) * 100) : 0}%`;
    });
    $(".coach-count", root).textContent =
      this.position < 0
        ? `Preparación: ${Math.min(4, Math.floor(this.position + 4) + 1)} / 4`
        : `Compás ${Math.min(this.to, this.from + Math.floor(position / this.score.meter))} · Pulso ${Math.floor(position % this.score.meter) + 1} / ${this.score.meter}`;
    const scroll = $(".score-scroll", root);
    const current = $$("[data-score-note].score-current", root).sort(
      (a, b) => Number(b.dataset.scoreStart) - Number(a.dataset.scoreStart),
    )[0];
    if (current) {
      const x = Number($("ellipse", current).getAttribute("cx"));
      if (
        x < scroll.scrollLeft + 80 ||
        x > scroll.scrollLeft + scroll.clientWidth - 65
      )
        scroll.scrollLeft = Math.max(0, x - 100);
    }
  }
  finish() {
    const was = this.prefs.mode;
    this.stop();
    this.paused = false;
    if (was === "preview") {
      this.message(
        "Así suena el pasaje. Pasá a “A mi ritmo” para tocarlo vos.",
      );
      if (this.prefs.loop) {
        this.position = 0;
        this.start();
      }
      return;
    }
    const summary = this.session.summary();
    if (summary.passed) {
      this.position = this.score.bars * this.score.meter;
      this.updateVisuals();
    }
    this.options.onResult?.({
      ...summary,
      mode: was,
      aid: this.prefs.aid,
      bpm: this.prefs.bpm,
      hand: this.prefs.hand,
      from: this.from,
      to: this.to,
      full:
        this.from === 1 &&
        this.to === this.fullScore.bars &&
        this.score.notes.length === this.fullScore.notes.length,
    });
    this.reported = true;
    this.message(
      summary.passed
        ? "¡Pasaje completo! Mirá qué afianzar en el resumen."
        : "Terminaste la vuelta. El resumen marca qué podés trabajar.",
      !summary.passed,
    );
    const results = $(".coach-results", this.root);
    results.hidden = false;
    if (this.focused) this.setFocus(false);
    results.innerHTML = `<div><span class="eyebrow">TU DEVOLUCIÓN · ${was === "step" ? "A TU RITMO" : "CON PULSO"}</span><h4>${summary.correct} de ${summary.total} notas con duración correcta</h4><p>${was === "step" ? "En este modo no se califica cuándo empezaste cada nota." : "Se compararon notas y ataques con el tempo elegido; también cuánto sostuviste cada tecla."}</p></div><strong class="coach-score">${summary.score}%</strong>${
      summary.errors.length
        ? `<ul>${summary.errors
            .slice(-8)
            .map(
              (e) =>
                `<li><span>Compás ${this.from + Math.floor(e.beat / this.score.meter)}</span> ${errorText(e)}</li>`,
            )
            .join(
              "",
            )}</ul><button class="secondary" data-repeat-error>Practicar el primer compás con error</button>`
        : summary.passed
          ? "<p>Todo el pasaje salió con control. Podés repetirlo o subir un poco la velocidad.</p>"
          : "<p>Faltaron notas o liberaciones. Volvé al modo a tu ritmo y terminá cada duración.</p>"
    }`;
    const retry = $("[data-repeat-error]", this.root);
    if (retry)
      retry.onclick = () => {
        const b = Math.min(
          this.to,
          this.from + Math.floor(summary.errors[0].beat / this.score.meter),
        );
        this.from = b;
        this.to = b;
        this.position = 0;
        this.prefs.mode = "step";
        this.persist();
        this.build();
      };
    if (
      summary.passed &&
      this.from === 1 &&
      this.to === this.fullScore.bars &&
      this.score.notes.length === this.fullScore.notes.length
    )
      this.options.onPass(summary.score);
    else if (summary.passed)
      this.message(
        "¡Pasaje completo! Para completar el ejercicio, practicá también los demás compases y las manos indicadas.",
      );
    if (this.prefs.loop) {
      this.loopTimer = setTimeout(() => {
        this.position = 0;
        this.start();
      }, 1600);
    }
  }
  suspend() {
    if (!this.running) return;
    this.stop();
    this.message(
      "Práctica pausada al salir de la ventana. Volvé a iniciar cuando estés listo.",
    );
    this.session = null;
    this.position = 0;
    this.inputKeys.clear();
  }
  dispose() {
    this.disposed = true;
    this.setFocus(false);
    this.root.onkeydown = null;
    this.stop();
    clearTimeout(this.loopTimer);
    this.options.releaseInput();
    this.root.classList.remove("guided-practice");
  }
}
