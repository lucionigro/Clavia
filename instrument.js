import { escapeHTML as esc } from "./repertoire.js";
import { pitchName } from "./guided-score.js";
export const keyCounts = [25, 32, 37, 49, 61, 73, 76, 88];
export const defaultFirst = {
  25: 48,
  32: 41,
  37: 48,
  49: 36,
  61: 36,
  73: 24,
  76: 28,
  88: 21,
};
export const defaultInstrument = () => ({
  keys: 61,
  firstNote: 36,
  model: "",
  connection: "virtual",
  midiId: "",
  localSound: true,
  configured: false,
});
export const defaultProfile = () => ({
  experience: "beginner",
  focus: "general",
});
export function validateInstrument(value = {}) {
  value = value && typeof value === "object" ? value : {};
  const keys = keyCounts.includes(value.keys) ? value.keys : 61;
  return {
    keys,
    firstNote:
      Number.isInteger(value.firstNote) &&
      value.firstNote >= 0 &&
      value.firstNote + keys <= 128
        ? value.firstNote
        : defaultFirst[keys],
    model: typeof value.model === "string" ? value.model.slice(0, 80) : "",
    connection: value.connection === "midi" ? "midi" : "virtual",
    midiId: typeof value.midiId === "string" ? value.midiId.slice(0, 200) : "",
    localSound: value.localSound !== false,
    configured: value.configured === true,
  };
}
export function validateProfile(value = {}) {
  value = value && typeof value === "object" ? value : {};
  return {
    experience: ["beginner", "returning", "advanced"].includes(value.experience)
      ? value.experience
      : "beginner",
    focus: ["general", "classical", "improvisation", "rock"].includes(
      value.focus,
    )
      ? value.focus
      : "general",
  };
}
export function instrumentRange(instrument) {
  return `${pitchName(instrument.firstNote)}–${pitchName(instrument.firstNote + instrument.keys - 1)}`;
}
export function rangeMismatch(score, instrument) {
  return score.notes.filter(
    (n) =>
      n.pitch < instrument.firstNote ||
      n.pitch >= instrument.firstNote + instrument.keys,
  ).length;
}
const optionsHTML = (selected) =>
  Array.from({ length: 73 }, (_, i) => i + 21)
    .map(
      (n) =>
        `<option value="${n}" ${n === selected ? "selected" : ""}>${pitchName(n)} · MIDI ${n}</option>`,
    )
    .join("");
export function instrumentSettingsHTML(state) {
  const p = state.instrument;
  return `<section class="panel instrument-settings"><div class="section-title"><div><span class="eyebrow">UN PERFIL PARA TU INSTRUMENTO</span><h2>Tu teclado, bien conectado.</h2></div><button class="secondary" data-open-setup>Revisar configuración →</button></div><p>${esc(p.model || "Mi teclado")} · ${p.keys} teclas · ${instrumentRange(p)}. Do4 es el Do central (MIDI 60).</p><div class="repertoire-filters"><label>Dispositivo MIDI<select id="midi-device"><option value="">Conectá tu teclado para verlo acá</option></select></label><label>Sonido al tocar en Clavia<select id="instrument-sound"><option value="yes" ${p.localSound ? "selected" : ""}>Activado</option><option value="no" ${!p.localSound ? "selected" : ""}>Solo mi instrumento físico</option></select></label></div><div class="midi-monitor"><span class="connection-dot"></span><span data-midi-status>Sin conexión MIDI activa</span><strong data-midi-note>Tocá una tecla para probar</strong></div><p class="hint">Si escuchás cada nota duplicada, elegí «Solo mi instrumento físico». La guía y los ejercicios de oído siguen teniendo sonido.</p></section>`;
}
export function bindInstrumentSettings({
  state,
  save,
  getDevices,
  onDevice,
  openSetup,
}) {
  const select = document.querySelector("#midi-device");
  if (!select) return;
  const devices = getDevices();
  select.innerHTML = devices.length
    ? devices
        .map((d) => `<option value="${esc(d.id)}">${esc(d.name)}</option>`)
        .join("")
    : '<option value="">No hay teclados conectados</option>';
  if (devices.some((d) => d.id === state.instrument.midiId))
    select.value = state.instrument.midiId;
  select.onchange = () => {
    state.instrument.midiId = select.value;
    save();
    onDevice();
  };
  document.querySelector("#instrument-sound").onchange = (e) => {
    state.instrument.localSound = e.target.value === "yes";
    save();
  };
  document
    .querySelectorAll("[data-open-setup]")
    .forEach((b) => (b.onclick = openSetup));
}
export function openSetup({ state, save, connect, getDevices, onDone }) {
  let existing = document.querySelector("#setup-dialog");
  if (existing) {
    existing.showModal();
    return;
  }
  const d = document.createElement("dialog");
  d.id = "setup-dialog";
  d.className = "setup-dialog";
  d.setAttribute("aria-labelledby", "setup-title");
  document.body.append(d);
  let step = 0;
  const draft = { ...state.instrument },
    profile = { ...state.profile };
  let goal = state.goal;
  const render = () => {
    d.innerHTML = `<div class="setup-brand"><span class="brand-mark">▥</span><strong>clavia.</strong><span>Tu espacio para hacer música</span><button class="close" data-setup-close aria-label="Configurar después">×</button></div><div class="setup-layout"><aside class="setup-story"><span class="eyebrow">QUE EMPIECE LA MÚSICA</span><h2>Un camino que<br>empieza con vos.</h2><p>Tu instrumento, tu ritmo y la música que querés tocar. Vamos a preparar tu espacio.</p><div class="setup-key-art" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<i class="${[1, 2, 4, 5, 6, 8, 9].includes(i) ? "with-black" : ""}"></i>`).join("")}</div><small>Local. Sin cuentas. Sin suscripciones.</small></aside><section class="setup-content"><div class="setup-progress">${["Instrumento", "Tu camino", "Conexión"].map((l, i) => `<span class="${i === step ? "active" : i < step ? "done" : ""}">${i < step ? "✓" : i + 1} ${l}</span>`).join("")}</div>${
      step === 0
        ? `<span class="eyebrow">01 / TU INSTRUMENTO</span><h1 id="setup-title">¿Qué teclado tenés?</h1><p>No importa la marca. Ajustamos el registro de las guías a las teclas que tenés.</p><label class="field">Cantidad de teclas<select id="setup-keys">${keyCounts.map((n) => `<option value="${n}" ${n === draft.keys ? "selected" : ""}>${n} teclas${n === 88 ? " · piano completo" : ""}</option>`).join("")}</select></label><label class="field">Marca y modelo <span class="hint">Opcional</span><input id="setup-model" maxlength="80" placeholder="Por ejemplo: Casio CT-S300" value="${esc(draft.model)}"></label><details class="setup-register"><summary>Revisar la tecla más grave</summary><label class="field">Primera tecla<select id="setup-first">${optionsHTML(draft.firstNote)}</select></label><p class="hint">La cantidad de teclas no determina por sí sola la octava. Verificá el rango ${instrumentRange(draft)}; después podés detectar la nota grave con MIDI.</p></details>`
        : step === 1
          ? `<span class="eyebrow">02 / TU CAMINO</span><h1 id="setup-title">¿Qué querés descubrir?</h1><p>Podés explorar todo. Tu elección organiza las sugerencias del día.</p><label class="field">Punto de partida<select id="setup-experience">${[
              ["beginner", "Empiezo desde cero"],
              ["returning", "Ya toqué y quiero retomar"],
              ["advanced", "Busco profundizar y estudiar obras"],
            ]
              .map(
                ([v, l]) =>
                  `<option value="${v}" ${profile.experience === v ? "selected" : ""}>${l}</option>`,
              )
              .join(
                "",
              )}</select></label><label class="field">Mi foco<select id="setup-focus">${[
              ["general", "Una formación musical completa"],
              ["classical", "Piano y música clásica"],
              ["improvisation", "Improvisar y crear"],
              ["rock", "Rock, pop y acompañamiento"],
            ]
              .map(
                ([v, l]) =>
                  `<option value="${v}" ${profile.focus === v ? "selected" : ""}>${l}</option>`,
              )
              .join(
                "",
              )}</select></label><label class="field">Tiempo que puedo dedicar<select id="setup-goal">${[10, 15, 20, 30, 45].map((n) => `<option value="${n}" ${n === goal ? "selected" : ""}>${n} minutos al día</option>`).join("")}</select></label>`
          : `<span class="eyebrow">03 / CONECTÁ Y PROBÁ</span><h1 id="setup-title">Que Clavia te escuche.</h1><p>Con un teclado USB MIDI podemos comparar notas, ataques y cuánto sostenés cada tecla.</p><div class="setup-connection-options"><label><input type="radio" name="setup-connection" value="midi" ${draft.connection === "midi" ? "checked" : ""}><strong>Mi teclado por USB MIDI</strong><span>Conectá el puerto USB del instrumento a la computadora y encendelo.</span></label><label><input type="radio" name="setup-connection" value="virtual" ${draft.connection === "virtual" ? "checked" : ""}><strong>Primero voy a explorar la app</strong><span>Uso mouse, pantalla táctil o teclado de computadora.</span></label></div><button class="secondary" id="setup-connect">Buscar mi teclado MIDI ↗</button><div class="midi-monitor"><span class="connection-dot"></span><span data-midi-status>Esperando la conexión</span><strong data-midi-note>Tocá una nota para probar</strong></div><div class="controls"><button class="text-button" id="setup-calibrate">Detectar mi tecla más grave</button><span class="hint" id="setup-range">${draft.keys} teclas · ${instrumentRange(draft)}</span></div><p id="setup-status" class="hint" role="status">Si tu instrumento tiene sonido propio, la app puede silenciar su sonido de entrada para evitar duplicación. No hace falta micrófono.</p>`
    }<div class="setup-actions">${step ? '<button class="text-button" data-setup-back>← Volver</button>' : '<button class="text-button" data-setup-later>Configurar después</button>'}<button class="dark-button" data-setup-next>${step === 2 ? "Entrar a Clavia →" : "Continuar →"}</button></div></section></div>`;
    d.querySelector("[data-setup-close]").onclick = () => d.close();
    d.querySelector("[data-setup-later]")?.addEventListener("click", () =>
      d.close(),
    );
    const capture = () => {
      if (step === 0) {
        draft.keys = Number(d.querySelector("#setup-keys").value);
        draft.firstNote = Number(d.querySelector("#setup-first").value);
        draft.model = d.querySelector("#setup-model").value.trim();
      }
      if (step === 1) {
        profile.experience = d.querySelector("#setup-experience").value;
        profile.focus = d.querySelector("#setup-focus").value;
        goal = Number(d.querySelector("#setup-goal").value);
      }
      if (step === 2)
        draft.connection = d.querySelector(
          '[name="setup-connection"]:checked',
        ).value;
    };
    if (step === 0)
      d.querySelector("#setup-keys").onchange = (e) => {
        const keys = Number(e.target.value);
        draft.firstNote = defaultFirst[keys];
        draft.keys = keys;
        d.querySelector("#setup-first").innerHTML = optionsHTML(
          draft.firstNote,
        );
      };
    d.querySelector("[data-setup-back]")?.addEventListener("click", () => {
      capture();
      step--;
      render();
    });
    d.querySelector("[data-setup-next]").onclick = () => {
      capture();
      if (draft.firstNote + draft.keys > 128) {
        if (step !== 0) {
          d.querySelector("#setup-status").textContent =
            "Esa tecla grave y cantidad de teclas no forman un registro MIDI válido. Volvé y revisá la configuración.";
          return;
        }
        d.querySelector("#setup-first").setCustomValidity(
          "El registro supera MIDI 127.",
        );
        d.querySelector("#setup-first").reportValidity();
        return;
      }
      if (step < 2) {
        step++;
        render();
        return;
      }
      draft.configured = true;
      draft.localSound = draft.connection === "virtual";
      state.instrument = validateInstrument(draft);
      state.profile = validateProfile(profile);
      state.goal = goal;
      state.guided.keyboard = draft.keys;
      state.guided.firstNote = draft.firstNote;
      save();
      d.close();
      onDone();
    };
    if (step === 2) {
      d.querySelector("#setup-connect").onclick = async () => {
        d.querySelector("#setup-status").textContent = "Buscando dispositivos…";
        await connect();
        const devices = getDevices();
        if (!d.open) return;
        d.querySelector("#setup-status").textContent = devices.length
          ? `${devices.length} teclado conectado. Tocá para verificar la entrada.`
          : "No se encontraron dispositivos. Revisá encendido, cable de datos y permiso MIDI. Podés continuar y conectarlo después.";
        if (devices.length) {
          draft.connection = "midi";
          draft.midiId = devices[0].id;
          d.querySelector('[name="setup-connection"][value="midi"]').checked =
            true;
        }
      };
      d.querySelector("#setup-calibrate").onclick = () => {
        d.dataset.calibrating = "true";
        d.querySelector("#setup-status").textContent =
          "Tocá ahora la tecla más grave de tu instrumento.";
      };
    }
  };
  d.addEventListener("clavia-midi", (e) => {
    if (d.dataset.calibrating === "true") {
      draft.firstNote = e.detail.pitch;
      delete d.dataset.calibrating;
      const range = d.querySelector("#setup-range");
      if (range)
        range.textContent = `${draft.keys} teclas · ${instrumentRange(draft)}`;
      const status = d.querySelector("#setup-status");
      if (status)
        status.textContent = `Tecla grave detectada: ${pitchName(draft.firstNote)}. Verificá también la cantidad de teclas.`;
    }
  });
  d.addEventListener(
    "close",
    () => {
      state.instrument.configured = true;
      save();
      d.remove();
    },
    { once: true },
  );
  render();
  d.showModal();
  d.querySelector("#setup-title").tabIndex = -1;
  d.querySelector("#setup-title").focus();
}
export function updateMIDIMonitor({ devices = [], pitch, velocity }) {
  document
    .querySelectorAll("[data-midi-status]")
    .forEach(
      (el) =>
        (el.textContent = devices.length
          ? "MIDI conectado · listo para tocar"
          : "Sin dispositivos conectados"),
    );
  document
    .querySelectorAll(".midi-monitor")
    .forEach((el) => el.classList.toggle("connected", devices.length > 0));
  if (pitch !== undefined) {
    document
      .querySelectorAll("[data-midi-note]")
      .forEach(
        (el) =>
          (el.textContent = `${pitchName(pitch)} · velocidad ${Math.round(velocity * 127)}/127`),
      );
    document
      .querySelector("#setup-dialog")
      ?.dispatchEvent(
        new CustomEvent("clavia-midi", { detail: { pitch, velocity } }),
      );
  }
}
