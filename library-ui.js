import {
  pieces,
  songCatalog,
  searchRepertoire,
  escapeHTML as esc,
} from "./repertoire.js";
import { openScoreImport } from "./import-dialog.js";
import { libraryRequest, validateImportedPiece } from "./library-store.js";
let bindingRevision = 0;
let imports = [],
  filters = { query: "", artist: "all", level: "all", kind: "ready" },
  activeOptions;
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
export function libraryHTML() {
  return `<div class="page-heading"><div><span class="eyebrow">TU MÚSICA, A TU RITMO</span><h1>Un repertorio para vos.</h1><p>Rock, piano y dos manos que aprenden a conversar.</p></div></div><section class="repertoire-hero"><div><span class="eyebrow">DE LA MELODÍA AL ARREGLO COMPLETO</span><h2>La izquierda también tiene<br>mucho para decir.</h2><p>15 arreglos incluidos con bajo, acordes y arpegios. Escuchá, separá las manos y después juntalas con la partitura y las teclas animadas.</p><button class="dark-button" data-library-start>Empezar con dos manos →</button></div><div class="duet-art" aria-hidden="true"><span>01 / ESCUCHÁ</span><div class="duet-voice right"><i></i><i></i><i></i><i></i><b>Melodía</b></div><div class="duet-voice left"><i></i><i></i><b>Acompañamiento</b></div><small>DERECHA + IZQUIERDA · UN MISMO PULSO</small></div></section><section class="repertoire-tools" aria-label="Buscar repertorio"><div class="repertoire-top"><div class="library-tabs" role="group" aria-label="Tipo de repertorio">${[
    ["ready", "Para tocar"],
    ["songs", "Tus artistas"],
    ["imports", "Mis partituras"],
    ["favorites", "Favoritos"],
  ]
    .map(
      ([id, label]) =>
        `<button data-library-kind="${id}" aria-pressed="${filters.kind === id}">${label}</button>`,
    )
    .join(
      "",
    )}</div><div class="controls"><button class="secondary" data-import-midi>Importar partitura ↑</button><button class="text-button" data-library-backup>Guardar mis partituras ↓</button></div></div><div class="repertoire-filters"><label>Buscar<input id="library-query" type="search" placeholder="Canción, artista o técnica…" value="${esc(filters.query)}"></label><label>Artista<select id="library-artist"><option value="all">Todos los artistas</option></select></label><label>Nivel del arreglo<select id="library-level"><option value="all">Todos los niveles</option>${["Principiante", "Inicial", "Intermedio", "Avanzado"].map((x) => `<option>${x}</option>`).join("")}</select></label></div></section><p class="hint" id="library-count" role="status" aria-live="polite">Cargando tu repertorio…</p><div id="library-results" class="repertoire-grid"></div><p class="hint repertoire-note">Las canciones comerciales del catálogo no incluyen su partitura ni una grabación. Importá un MIDI de piano que tengas derecho a usar para practicarlas. Los arreglos incluidos son composiciones originales y temas de dominio público, identificados en cada pieza. Todo se procesa y guarda en este equipo.</p>`;
}
export async function bindLibrary(options) {
  const revision = ++bindingRevision;
  activeOptions = options;
  const root = $("#main");
  try {
    imports = (await libraryRequest("getAll")).map(validateImportedPiece);
  } catch (e) {
    options.toast(e.message);
    imports = [];
  }
  if (revision !== bindingRevision || !$("#library-results", root)) return;
  const artists = [
    ...new Set([...pieces, ...songCatalog, ...imports].map((p) => p.artist)),
  ];
  $("#library-artist").innerHTML =
    '<option value="all">Todos los artistas</option>' +
    artists.map((a) => `<option value="${esc(a)}">${esc(a)}</option>`).join("");
  $("#library-artist").value = artists.includes(filters.artist)
    ? filters.artist
    : "all";
  filters.artist = $("#library-artist").value;
  $("#library-level").value = filters.level;
  $("#library-query").oninput = (e) => {
    filters.query = e.target.value;
    draw();
  };
  $("#library-artist").onchange = (e) => {
    filters.artist = e.target.value;
    if (
      filters.artist !== "all" &&
      filters.artist !== "Clavia" &&
      filters.kind === "ready"
    ) {
      filters.kind = "songs";
      updateTabs();
    }
    draw();
  };
  $("#library-level").onchange = (e) => {
    filters.level = e.target.value;
    draw();
  };
  $$("[data-library-kind]").forEach(
    (b) =>
      (b.onclick = () => {
        filters.kind = b.dataset.libraryKind;
        filters.artist = "all";
        $("#library-artist").value = "all";
        updateTabs();
        draw();
      }),
  );
  $("[data-import-midi]").onclick = () => openImport(options);
  $("[data-library-start]").onclick = () => options.openPiece(pieces[0]);
  $("[data-library-backup]").onclick = () => {
    download(
      "clavia-mis-midi.json",
      JSON.stringify({ format: "clavia-library-v1", pieces: imports }, null, 2),
    );
    options.toast(
      "Copia de tus MIDI guardada. Exportá también el progreso desde Ajustes.",
    );
  };
  function updateTabs() {
    $$("[data-library-kind]").forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.libraryKind === filters.kind),
    );
  }
  function draw() {
    const state = options.state;
    let source =
      filters.kind === "ready"
        ? [...pieces, ...imports]
        : filters.kind === "songs"
          ? songCatalog
          : filters.kind === "imports"
            ? imports
            : [...pieces, ...imports, ...songCatalog];
    const results = searchRepertoire(source, {
      ...filters,
      favorites: filters.kind === "favorites",
      favoriteIds: state.favorites,
    });
    $("#library-count").textContent =
      `${results.length} ${results.length === 1 ? "pieza" : "piezas"} · ${filters.kind === "songs" ? "Catálogo: elegí una canción e importá tu MIDI. El nivel depende del arreglo." : "Practicá cada mano por separado y después elegí «Las dos manos»."}`;
    $("#library-results").innerHTML = results.length
      ? results
          .map((p) => {
            const favorite = state.favorites.includes(p.id),
              progress = state.repertoire[p.id],
              linked = imports.find((i) => i.catalogId === p.id),
              hands = p.score
                ? new Set(p.score.notes.map((n) => n.hand)).size
                : 0;
            return `<article class="repertoire-card ${p.licensed ? "catalog-card" : ""}"><div class="piece-meta"><span>${esc(p.artist)}</span><button class="favorite-button" data-favorite="${p.id}" aria-pressed="${favorite}" aria-label="${favorite ? "Quitar de" : "Agregar a"} favoritos: ${esc(p.title)}">${favorite ? "★" : "☆"}</button></div><h2>${esc(p.title)}</h2><div class="piece-tags"><span>${esc(p.level)}</span><span>${p.licensed ? (linked ? "Tu MIDI disponible" : "Catálogo · requiere MIDI") : hands === 2 ? "Dos manos" : "Una mano"}</span>${p.score ? `<span>${p.score.bars} compases · ${p.score.timeSignature || `${p.score.meter}/4`}</span>` : ""}</div><p>${esc(p.goal || p.focus || p.detail)}</p><div class="piece-footer"><small>${progress ? `${progress.attempts} prácticas · mejor ${progress.best}%${progress.completed ? (hands === 2 ? " · completa a dos manos" : " · completa") : ""}` : p.licensed ? "Sumala a tus favoritos para estudiarla." : esc(p.detail)}</small><button class="${p.licensed && !linked ? "secondary" : "dark-button"}" data-library-open="${p.id}">${p.licensed && !linked ? "Agregar mi MIDI ↑" : progress ? "Volver a practicar →" : "Tocar →"}</button></div>${p.id.startsWith("import-") ? `<button class="text-button danger piece-delete" data-delete-piece="${p.id}">Eliminar archivo importado</button>` : ""}</article>`;
          })
          .join("")
      : `<section class="panel library-empty"><h2>${filters.kind === "imports" ? "Tus canciones empiezan acá." : "No encontramos piezas con esos filtros."}</h2><p>${filters.kind === "imports" ? "Importá MusicXML o MIDI y elegí qué toca cada mano. La guía de teclado se genera automáticamente." : "Probá otro artista, nivel o nombre."}</p><button class="secondary" data-empty-action>${filters.kind === "imports" ? "Importar partitura ↑" : "Limpiar filtros"}</button></section>`;
    $$("[data-favorite]").forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.dataset.favorite;
          state.favorites = state.favorites.includes(id)
            ? state.favorites.filter((x) => x !== id)
            : [...state.favorites, id];
          options.save();
          draw();
        }),
    );
    $$("[data-library-open]").forEach(
      (b) =>
        (b.onclick = () => {
          const p = source.find((p) => p.id === b.dataset.libraryOpen);
          if (p.licensed) {
            const linked = imports.find((i) => i.catalogId === p.id);
            linked ? options.openPiece(linked) : openImport(options, p);
          } else options.openPiece(p);
        }),
    );
    $$("[data-delete-piece]").forEach(
      (b) =>
        (b.onclick = async () => {
          if (
            !confirm(
              "¿Eliminar este MIDI del repertorio local? Podés guardar una copia antes.",
            )
          )
            return;
          try {
            await libraryRequest("delete", b.dataset.deletePiece);
            imports = imports.filter((p) => p.id !== b.dataset.deletePiece);
            draw();
          } catch (e) {
            options.toast(e.message);
          }
        }),
    );
    $("[data-empty-action]")?.addEventListener("click", () => {
      if (filters.kind === "imports") openImport(options);
      else {
        filters.query = "";
        filters.artist = "all";
        filters.level = "all";
        $("#library-query").value = "";
        $("#library-artist").value = "all";
        $("#library-level").value = "all";
        draw();
      }
    });
  }
  draw();
}
export function refreshLibrary() {
  if ($("#library-results")) bindLibrary(activeOptions);
}
function download(name, text) {
  const a = document.createElement("a"),
    url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function openImport(options, catalog) {
  openScoreImport(options, catalog, (p) => {
    if (p) imports.push(p);
    refreshLibrary();
  });
}
