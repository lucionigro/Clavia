import { escapeHTML as esc } from "./repertoire.js";
import { parseMIDI, scoreFromMIDI } from "./midi-file.js";
import { readMusicXMLFile } from "./musicxml-file.js";
import { libraryRequest, validateImportedPiece } from "./library-store.js";
import { scoreSVG } from "./guided-ui.js";
import { pitchName } from "./guided-score.js";
const $ = (s, r) => r.querySelector(s),
  $$ = (s, r) => [...r.querySelectorAll(s)];
let importRevision = 0;
export function openScoreImport(options, catalog, onSaved = () => {}) {
  options.cleanup();
  const d = options.dialog,
    revision = ++importRevision;
  d.innerHTML = `<div class="dialog-head"><div><span class="eyebrow">DE TU PARTITURA A LAS TECLAS</span><h2 id="lesson-title">${catalog ? esc(catalog.title) : "Traé tu próxima pieza."}</h2></div><button class="close" aria-label="Cerrar importación">×</button></div><div class="dialog-body import-body"><div class="import-steps"><span class="active">01 Archivo</span><span>02 Manos y compases</span><span>03 Tu guía</span></div><div class="import-drop"><span class="import-file-icon" aria-hidden="true">♬</span><h3>La partitura arriba. Tu teclado abajo.</h3><p>Elegí MusicXML para conservar notas, ritmos y pentagramas. También podés traer MIDI o restaurar una copia de Clavia.</p><label class="dark-button import-upload">Elegir un archivo<input id="midi-upload" type="file" accept=".musicxml,.xml,.mxl,.mid,.midi,.json,.pdf"></label><span class="file-types">MUSICXML · MXL · MIDI · COPIA JSON</span></div><details class="import-help"><summary>Mi partitura es un PDF o una foto</summary><p>Un PDF es una página visual. Para construir una guía hay que reconocer las notas, voces y duraciones. Convertí el archivo con <a class="source-link" href="https://audiveris.github.io/audiveris/_pages/handbook/" target="_blank" rel="noreferrer">Audiveris</a>, revisá el resultado en tu editor de partituras y exportá MusicXML. No se sube tu PDF desde Clavia.</p><p>Si ya usás MuseScore: <strong>Archivo → Exportar → MusicXML</strong>. <a class="source-link" href="https://handbook.musescore.org/file-management/working-with-musicxml-files" target="_blank" rel="noreferrer">Ver la documentación</a>.</p></details><div class="import-sample"><span>¿Querés probar el flujo?</span><a class="text-button source-link" href="examples/primer-dialogo.musicxml" download="primer-dialogo.musicxml">Descargar partitura de ejemplo ↓</a></div><div id="midi-import-form"></div><p id="midi-import-status" role="status" aria-live="polite"></p></div>`;
  d.showModal();
  $(".close", d).onclick = () => {
    importRevision++;
    d.close();
  };
  let fileRevision = 0;
  $("#midi-upload", d).onchange = async (e) => {
    const file = e.target.files[0],
      current = ++fileRevision;
    if (!file) return;
    $("#midi-import-form", d).innerHTML = "";
    $("#midi-import-status", d).textContent = "Leyendo tu archivo…";
    const live = () =>
      d.open && revision === importRevision && current === fileRevision;
    try {
      const extension = file.name.toLowerCase().split(".").pop();
      if (extension === "pdf") {
        const help = $(".import-help", d);
        help.open = true;
        throw Error(
          "El PDF necesita reconocimiento óptico y revisión. Convertí a MusicXML con la guía de arriba y volvé a importarlo.",
        );
      }
      if (
        !["json", "xml", "musicxml", "mxl", "mid", "midi"].includes(extension)
      )
        throw Error("Elegí MusicXML, MXL, MIDI o una copia JSON de Clavia.");
      if (
        file.size >
        (extension === "json"
          ? 20_000_000
          : extension === "mid" || extension === "midi"
            ? 2_000_000
            : 8_000_000)
      )
        throw Error(
          "Archivo demasiado grande: MusicXML/MXL hasta 8 MB, MIDI hasta 2 MB, copias hasta 20 MB.",
        );
      const input = await file.arrayBuffer();
      if (!live()) return;
      if (extension === "json") {
        const backup = JSON.parse(new TextDecoder().decode(input));
        if (
          backup.format !== "clavia-library-v1" ||
          !Array.isArray(backup.pieces) ||
          backup.pieces.length > 100
        )
          throw Error(
            "Para una copia completa usá Ajustes → Importar copia. Acá podés restaurar «clavia-mis-midi.json».",
          );
        const candidates = backup.pieces.map(validateImportedPiece);
        $("#midi-import-form", d).innerHTML =
          `<p>${candidates.length} arreglos verificados. Se suman a tu repertorio; los identificadores iguales se reemplazan.</p><button class="dark-button" id="restore-midi">Restaurar copia</button>`;
        $("#midi-import-status", d).textContent = "Copia verificada.";
        $("#restore-midi", d).onclick = async (e) => {
          e.target.disabled = true;
          try {
            await libraryRequest("putMany", candidates);
            if (!live()) return;
            d.close();
            onSaved();
            options.toast("Repertorio restaurado.");
          } catch (error) {
            if (live()) $("#midi-import-status", d).textContent = error.message;
          }
        };
        return;
      }
      const parsed = ["mid", "midi"].includes(extension)
        ? parseMIDI(input)
        : readMusicXMLFile(input, file.name);
      const isXML = parsed.format === "musicxml",
        last = Math.max(
          ...parsed.tracks.flatMap((t) =>
            t.notes.map((n) => n.start + n.duration),
          ),
        ),
        bars = parsed.bars || Math.ceil((last - 1e-7) / parsed.meter);
      $(".import-steps", d).children[1].classList.add("active");
      $("#midi-import-form", d).innerHTML =
        `<div class="import-file-summary"><span class="file-format">${isXML ? "MusicXML" : "MIDI"}</span><strong>${esc(file.name)}</strong><small>${bars} compases · ${parsed.timeSignature || parsed.meter + "/4"} · ${parsed.tracks.length} ${isXML ? "pentagramas" : "pistas"}</small></div><div class="grid-two"><label class="field">Título<input id="midi-title" maxlength="100" value="${esc(catalog?.title || parsed.title || file.name.replace(/\.[^.]+$/, ""))}"></label><label class="field">Compositor o artista<input id="midi-artist" maxlength="100" value="${esc(catalog?.artist || parsed.composer || "Mi repertorio")}"></label></div><h3>Una voz para cada mano.</h3><p class="hint">${isXML ? "Los pentagramas sugieren las manos. Revisalos: la música puede cruzar voces o registros." : "Elegí las pistas de piano. La división por Do4 es orientativa; las pistas separadas son más precisas."}</p><div class="midi-tracks">${parsed.tracks
          .map(
            (t, i) =>
              `<label class="midi-track"><span>${esc(t.name)}<small>${t.notes.length} notas · ${pitchName(t.low)}–${pitchName(t.high)}</small></span><select data-track="${t.id}" aria-label="Mano para ${esc(t.name)}">${[
                ["skip", "No usar"],
                ["split", "Dividir en Do4"],
                ["left", "Izquierda"],
                ["right", "Derecha"],
              ]
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${value === (isXML ? t.suggestedHand : i === 0 ? "split" : "skip") ? "selected" : ""}>${label}</option>`,
                )
                .join("")}</select></label>`,
          )
          .join(
            "",
          )}</div><div class="repertoire-filters"><label>Desde compás<input id="midi-from" type="number" min="1" max="${bars}" value="1"></label><label>Hasta compás<input id="midi-to" type="number" min="1" max="${bars}" value="${Math.min(bars, 8)}"></label><label>Nivel<select id="midi-level">${["Principiante", "Inicial", "Intermedio", "Avanzado"].map((l) => `<option ${l === (catalog?.level || "Intermedio") ? "selected" : ""}>${l}</option>`).join("")}</select></label></div><div class="repertoire-filters"><label>Registro<select id="score-transpose"><option value="0">Altura original</option><option value="-12">Una octava abajo (−12)</option><option value="12">Una octava arriba (+12)</option></select></label><label>Ritmo de la guía<select id="score-quantum" ${isXML ? "disabled" : ""}><option value="0.5">MIDI: corcheas</option><option value="0.25">MIDI: semicorcheas</option>${isXML ? '<option value="xml" selected>Duraciones de la partitura</option>' : ""}</select></label></div><div class="import-warning">${(parsed.warnings || []).map((w) => `<p>${esc(w)}</p>`).join("")}${parsed.tempoChanges ? "<p>El archivo cambia de tempo. La práctica usa un tempo fijo que podés ajustar.</p>" : ""}<p>Tempo de origen: ${parsed.bpm} BPM de negra. Se admiten pasajes de hasta 128 compases y 5.000 notas. Clavia crea una guía de estudio; conservá tu edición para expresión y detalles de interpretación.</p></div><div class="controls"><button class="secondary" id="preview-score">Revisar la guía</button><button class="dark-button" id="save-midi">Guardar y practicar →</button></div><div id="import-score-preview"></div>`;
      $("#midi-import-status", d).textContent =
        "Elegí manos y compases. Al guardar se crean la partitura y las teclas animadas.";
      function buildScore() {
        const title = $("#midi-title", d).value.trim(),
          from = Number($("#midi-from", d).value),
          to = Number($("#midi-to", d).value),
          transpose = Number($("#score-transpose", d).value);
        if (!title) throw Error("Escribí un título.");
        if (to > bars) throw Error("Ese compás no existe en el archivo.");
        const score = scoreFromMIDI(
          parsed,
          Object.fromEntries(
            $$("[data-track]", d).map((s) => [s.dataset.track, s.value]),
          ),
          {
            title,
            from,
            to,
            quantum: isXML ? 1 / 24 : Number($("#score-quantum", d).value),
          },
        );
        if (transpose)
          for (const n of score.notes) {
            n.pitch += transpose;
            if (n.label)
              n.label = n.label.replace(
                /(-?\d+)$/,
                (v) => Number(v) + transpose / 12,
              );
          }
        const instrument = options.state.instrument || {
          keys: 61,
          firstNote: 36,
        };
        const low = instrument.firstNote,
          high = low + instrument.keys - 1;
        const out = score.notes.filter((n) => n.pitch < low || n.pitch > high);
        if (out.length && instrument.connection !== "virtual")
          throw Error(
            `${out.length} notas quedan fuera de tu teclado (${pitchName(low)}–${pitchName(high)}). Elegí otros compases, transportá una octava o revisá tu instrumento en Ajustes.`,
          );
        if (score.notes.some((n) => n.pitch < 21 || n.pitch > 108))
          throw Error("La guía sale del rango de un piano de 88 teclas.");
        return score;
      }
      $("#preview-score", d).onclick = () => {
        try {
          const score = buildScore();
          $("#import-score-preview", d).innerHTML =
            `<h3>Así se verá tu guía.</h3><p class="hint">${score.notes.length} notas · ${new Set(score.notes.map((n) => n.hand)).size === 2 ? "Dos manos" : "Una mano"} · ${score.bars} compases. Al practicar aparecen también las teclas animadas.</p><div class="score-scroll">${scoreSVG(score, "names")}</div>`;
          $("#midi-import-status", d).textContent =
            "Revisá notas, compases y manos antes de guardar.";
        } catch (error) {
          $("#midi-import-status", d).textContent = error.message;
        }
      };
      $("#save-midi", d).onclick = async (e) => {
        e.target.disabled = true;
        try {
          const score = buildScore();
          const p = validateImportedPiece({
            id: `import-${crypto.randomUUID()}`,
            title: score.title,
            artist: $("#midi-artist", d).value.trim() || "Mi repertorio",
            level: $("#midi-level", d).value,
            catalogId: catalog?.id || "",
            format: isXML ? "musicxml" : "midi",
            bpm: parsed.bpm,
            score,
          });
          await libraryRequest("put", p);
          if (!live()) return;
          $(".import-steps", d).children[2].classList.add("active");
          d.close();
          onSaved(p);
          options.openPiece(p);
          options.toast(
            "Partitura guardada. Tu guía de teclado ya está lista.",
          );
        } catch (error) {
          if (live()) {
            $("#midi-import-status", d).textContent = error.message;
            e.target.disabled = false;
          }
        }
      };
    } catch (error) {
      if (live()) $("#midi-import-status", d).textContent = error.message;
    }
  };
}
