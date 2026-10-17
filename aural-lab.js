import { pitchName } from "./guided-score.js";
export function newAuralSample(kind = "melody", length = 3, rng = Math.random) {
  const root = 60,
    scale = [0, 2, 4, 5, 7, 9, 11, 12];
  if (kind === "chord") {
    const quality = Math.floor(rng() * 4),
      sets = [
        [0, 4, 7],
        [0, 3, 7],
        [0, 3, 6],
        [0, 4, 7, 10],
      ];
    return {
      kind,
      quality,
      notes: sets[quality].map((p) => ({
        pitch: root + p,
        duration: 1,
        start: 0,
      })),
    };
  }
  const notes = [];
  let start = 0;
  for (let i = 0; i < length; i++) {
    const duration =
      kind === "rhythm" ? [0.5, 1, 1.5][Math.floor(rng() * 3)] : 1;
    notes.push({
      pitch:
        kind === "rhythm" ? 60 : root + scale[Math.floor(rng() * scale.length)],
      duration,
      start,
    });
    start += duration;
  }
  return { kind, notes };
}
export function compareAural(sample, response) {
  const expected = sample.notes;
  let correct = 0;
  for (let i = 0; i < Math.min(expected.length, response.length); i++)
    if (expected[i].pitch === response[i].pitch) correct++;
  const first = response[0]?.start || 0;
  const errors = expected.map((n, i) =>
    response[i]
      ? Math.abs(response[i].start - first - n.start * 600)
      : Infinity,
  );
  const timing =
    sample.kind === "rhythm"
      ? Math.round(
          (errors.filter((e) => e < 180).length / expected.length) * 100,
        )
      : null;
  return {
    pitch: Math.round(
      (correct / Math.max(expected.length, response.length, 1)) * 100,
    ),
    timing,
    expected: expected.length,
    played: response.length,
  };
}
export class AuralLab {
  constructor(root, options) {
    this.root = root;
    this.options = options;
    this.timers = [];
    this.held = new Map();
    this.response = [];
    this.ready = false;
    this.build();
  }
  build() {
    this.root.innerHTML = `<div class="lab-heading"><div><span class="eyebrow">DEL SONIDO A TUS MANOS</span><h2>Escuchá. Imaginá. Respondé.</h2><p>Una melodía nueva en cada ronda. La partitura aparece después de tu intento.</p></div><span class="lab-badge">Oído activo</span></div><div class="improv-controls"><label>Qué entrenamos<select id="aural-kind"><option value="melody">Eco melódico · tocá lo que escuchás</option><option value="rhythm">Eco rítmico · una nota, varios ritmos</option><option value="chord">Reconocer acordes</option></select></label><label>Longitud<select id="aural-length"><option value="3">3 notas</option><option value="5">5 notas</option><option value="7">7 notas</option></select></label></div><div class="aural-orb" aria-hidden="true"><i></i><span>♪</span><i></i></div><div class="controls"><button class="dark-button" data-aural-listen>Escuchar ejemplo</button><button class="secondary" data-aural-new>Otro ejemplo</button><button class="text-button" data-aural-reveal>Ver la respuesta</button></div><div class="aural-status" role="status" aria-live="polite">Escuchá antes de tocar. Referencia: Do4 es el Do central.</div><div class="aural-response"></div><div class="aural-piano"></div><p class="hint">El eco melódico compara alturas en orden. El eco rítmico usa una negra de 600 ms y compara tus entradas después de la primera; también podés escuchar y repetir libremente. Mirar la respuesta cambia la ronda a práctica asistida, no a una evaluación de oído.</p>`;
    this.$ = (s) => this.root.querySelector(s);
    this.$(".aural-piano").innerHTML = this.options.pianoHTML([60, 72]);
    this.options.bindPiano(this.$(".aural-piano"));
    this.$("[data-aural-listen]").onclick = () => this.listen();
    this.$("[data-aural-new]").onclick = () => this.newSample();
    this.$("[data-aural-reveal]").onclick = () => this.reveal();
    this.$("#aural-kind").onchange = () => this.newSample();
    this.$("#aural-length").onchange = () => this.newSample();
    this.newSample();
  }
  newSample() {
    this.cancel();
    this.sample = newAuralSample(
      this.$("#aural-kind").value,
      Number(this.$("#aural-length").value),
    );
    this.response = [];
    this.ready = false;
    this.assisted = false;
    this.$(".aural-response").innerHTML = "";
    this.$(".aural-status").textContent =
      "Ejemplo nuevo. Escuchá antes de responder.";
  }
  tone(n, key) {
    this.options.soundOn(n.pitch, key);
    this.timers.push(
      setTimeout(() => this.options.soundOff(key), n.duration * 600 * 0.8),
    );
  }
  listen() {
    this.cancel();
    this.options.audioReady();
    this.response = [];
    this.held.clear();
    this.ready = false;
    this.$(".aural-response").innerHTML = "";
    this.$(".aural-status").textContent =
      "Escuchá sin mirar el teclado. Después respondé.";
    this.$(".aural-orb").classList.add("listening");
    let end = 0;
    this.sample.notes.forEach((n, i) => {
      const time = n.start * 600;
      end = Math.max(end, time + n.duration * 600);
      this.timers.push(setTimeout(() => this.tone(n, `aural:${i}`), time));
    });
    this.timers.push(
      setTimeout(() => {
        this.ready = true;
        this.$(".aural-orb").classList.remove("listening");
        this.$(".aural-status").textContent =
          this.sample.kind === "chord"
            ? "Elegí el tipo de acorde que escuchaste."
            : "Ahora tocá tu respuesta. La primera nota inicia tu referencia de tiempo.";
        if (this.sample.kind === "chord") this.chordChoices();
      }, end + 200),
    );
  }
  chordChoices() {
    const labels = ["Mayor", "Menor", "Disminuido", "Séptima de dominante"];
    this.$(".aural-response").innerHTML =
      `<div class="answer-grid">${labels.map((l, i) => `<button class="answer" data-aural-quality="${i}">${l}</button>`).join("")}</div>`;
    this.root.querySelectorAll("[data-aural-quality]").forEach(
      (b) =>
        (b.onclick = () => {
          if (!this.ready) return;
          this.ready = false;
          const correct =
            Number(b.dataset.auralQuality) === this.sample.quality;
          b.classList.add(correct ? "correct" : "wrong");
          this.$(".aural-status").textContent =
            `${correct ? "Lo reconociste." : "Este acorde era " + labels[this.sample.quality].toLowerCase() + "."} Escuchá otra vez sus notas o elegí un ejemplo nuevo.`;
        }),
    );
  }
  noteOn(pitch) {
    if (!this.ready || this.sample.kind === "chord" || this.held.has(pitch))
      return;
    const n = { pitch, start: performance.now(), duration: 0 };
    this.held.set(pitch, n);
    this.response.push(n);
    this.$(".aural-status").textContent =
      `Recibidas ${this.response.length} de ${this.sample.notes.length} notas.`;
  }
  noteOff(pitch) {
    const n = this.held.get(pitch);
    if (!n) return;
    n.duration = performance.now() - n.start;
    this.held.delete(pitch);
    if (this.response.length >= this.sample.notes.length && !this.held.size) {
      this.ready = false;
      const r = compareAural(this.sample, this.response);
      this.$(".aural-status").textContent =
        `${this.assisted ? "Práctica asistida" : "Tu respuesta de oído"} · alturas ${r.pitch}%${r.timing !== null ? " · entradas rítmicas " + r.timing + "%" : ""}. Escuchá de nuevo o compará con la respuesta.`;
      this.options.onResult?.(r);
    }
  }
  reveal() {
    this.assisted = true;
    this.$(".aural-response").innerHTML =
      `<p class="aural-answer">${this.sample.notes.map((n) => `${pitchName(n.pitch)}${this.sample.kind === "rhythm" ? " (" + n.duration + " negras)" : ""}`).join(" → ")}</p>`;
    this.$(".aural-status").textContent =
      "Respuesta visible: ahora es práctica asistida. Elegí «Otro ejemplo» para volver a entrenar de oído.";
  }
  cancel() {
    this.ready = false;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.options.silence();
    this.held.clear();
    this.$?.(".aural-orb")?.classList.remove("listening");
  }
  dispose() {
    this.ready = false;
    this.cancel();
    this.root.innerHTML = "";
  }
}
