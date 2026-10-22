// Muestras locales: Salamander Grand Piano / Alexander Holm (CC BY 3.0).
export const soundPresets = [
  { id: "grand", name: "Piano de cola", cutoff: 14000, gain: 1, release: 0.22 },
  { id: "soft", name: "Piano suave", cutoff: 2400, gain: 1.15, release: 0.28 },
  {
    id: "electric",
    name: "Piano eléctrico",
    partials: [1, 0.35, 0, 0.12],
    decay: 2.5,
    release: 0.18,
  },
  {
    id: "organ",
    name: "Órgano",
    partials: [1, 0.45, 0.25, 0.12],
    decay: 0,
    release: 0.06,
  },
];
export const validateSound = (id) =>
  soundPresets.some((p) => p.id === id) ? id : "grand";
export const soundOptions = (selected) =>
  soundPresets
    .map(
      (p) =>
        `<option value="${p.id}" ${p.id === selected ? "selected" : ""}>${p.name}</option>`,
    )
    .join("");
export const pianoSamples = [
  { pitch: 21, name: "A0" },
  ...Array.from({ length: 7 }, (_, i) =>
    [0, 3, 6, 9].map((offset, j) => ({
      pitch: (i + 2) * 12 + offset,
      name: `${["C", "Ds", "Fs", "A"][j]}${i + 1}`,
    })),
  ).flat(),
  { pitch: 108, name: "C8" },
];
export const nearestSample = (pitch) =>
  pianoSamples.reduce((a, b) =>
    Math.abs(b.pitch - pitch) < Math.abs(a.pitch - pitch) ? b : a,
  );

export class KeyboardSound {
  constructor(context, onError = () => {}) {
    this.context = context;
    this.onError = onError;
    this.buffers = new Map();
    this.output = context.createGain();
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 12;
    limiter.ratio.value = 12;
    this.output.connect(limiter);
    limiter.connect(context.destination);
  }
  load(sample) {
    if (!this.buffers.has(sample.name)) {
      const pending = fetch(`assets/piano/${sample.name}.mp3`)
        .then((r) => {
          if (!r.ok) throw Error("No se pudo abrir la muestra de piano");
          return r.arrayBuffer();
        })
        .then((bytes) => this.context.decodeAudioData(bytes))
        .catch((error) => {
          this.buffers.delete(sample.name);
          throw error;
        });
      this.buffers.set(sample.name, pending);
    }
    return this.buffers.get(sample.name);
  }
  prepare() {
    // Precarga local en segundo plano; cada tecla espera únicamente su muestra.
    return Promise.all(pianoSamples.map((sample) => this.load(sample)));
  }
  start(pitch, velocity, volume, presetId = "grand") {
    const ctx = this.context;
    const preset = soundPresets.find((p) => p.id === validateSound(presetId));
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = preset.cutoff || 12000;
    gain.connect(filter);
    filter.connect(this.output);
    const sources = [];
    let stopped = false;
    let timer;
    const dispose = () => {
      gain.disconnect();
      filter.disconnect();
      sources.forEach((s) => s.disconnect());
    };
    const stop = () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(timer);
      const t = ctx.currentTime;
      gain.gain.cancelAndHoldAtTime(t);
      gain.gain.setTargetAtTime(0, t, preset.release / 3);
      sources.forEach((s) => s.stop(t + preset.release + 0.03));
      setTimeout(dispose, (preset.release + 0.08) * 1000);
    };
    const begin = (buffer) => {
      if (stopped) return;
      const t = ctx.currentTime;
      const level = Math.max(
        0.00001,
        volume * Math.max(0, Math.min(1, velocity)) * (preset.gain || 0.35),
      );
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(level, t + 0.006);
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value =
          2 ** ((pitch - nearestSample(pitch).pitch) / 12);
        source.connect(gain);
        sources.push(source);
      } else {
        preset.partials.forEach((amplitude, i) => {
          if (!amplitude) return;
          const source = ctx.createOscillator();
          const partialGain = ctx.createGain();
          source.frequency.value = 440 * 2 ** ((pitch - 69) / 12) * (i + 1);
          partialGain.gain.value = amplitude;
          if (preset.decay)
            partialGain.gain.setTargetAtTime(
              0.00001,
              t + 0.02,
              preset.decay / (i + 1),
            );
          source.connect(partialGain);
          partialGain.connect(gain);
          source.onended = () => partialGain.disconnect();
          sources.push(source);
        });
      }
      sources.forEach((s) => s.start(t));
    };
    if (preset.partials) begin();
    else
      this.load(nearestSample(pitch))
        .then(begin)
        .catch(() => {
          if (!stopped) {
            stop();
            this.onError();
          }
        });
    // Límite de emergencia ante pérdida de note-off, también en segundo plano.
    timer = setTimeout(stop, 30000);
    return { stop };
  }
}
