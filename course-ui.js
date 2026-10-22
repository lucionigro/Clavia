import {
  studyDomains,
  lessonDomain,
  domainProgress,
  evidenceStatus,
} from "./learning.js";
import { escapeHTML as esc } from "./repertoire.js";
import {
  courseChapters,
  nextPathLesson,
  chapterForLesson,
} from "./learning-path.js";

export function courseHTML({
  state,
  lessons,
  levels,
  level = -1,
  domain = "all",
  query = "",
}) {
  const next = nextPathLesson(state, lessons);
  const chapter = next && chapterForLesson(next.id);
  const done = lessons.filter((l) => state.completed.includes(l.id)).length;
  return `<div class="page-heading"><div><span class="eyebrow">UN PASO A LA VEZ</span><h1>Tu camino en el teclado.</h1><p>Empezá por el paso 1. Cada bloque prepara lo que viene después.</p></div><span class="course-total">${lessons.length}<small>lecciones · 12 bloques</small></span></div>
    <section class="path-continue" aria-label="Tu próximo paso"><div><span class="eyebrow">${next ? `BLOQUE ${courseChapters.indexOf(chapter) + 1} · PASO ${lessons.indexOf(next) + 1} DE ${lessons.length}` : "RECORRIDO COMPLETADO"}</span><h2>${next ? esc(next.title) : "Volvé a la música que querés afianzar."}</h2><p>${next ? esc(chapter.description) : "Podés repetir cualquier lección y seguir practicando a tu ritmo."}</p>${next ? `<button class="primary" data-lesson="${next.id}">${done ? "Continuar mi recorrido" : "Empezar por el paso 1"} <span>→</span></button>` : ""}</div><div class="path-progress"><strong>${done}<small> / ${lessons.length}</small></strong><span>lecciones completadas</span><progress value="${done}" max="${lessons.length}" aria-label="Lecciones completadas"></progress><p>Comprendé → Tocá → Comprobá<br>Después, practicá en tu instrumento.</p></div></section>
    <section class="course-browser" aria-label="Recorrido de clases"><div class="section-title"><div><span class="eyebrow">DE PRINCIPIANTE A AVANZADO</span><h2>Tu recorrido, en orden.</h2></div><button class="text-button" data-course-reset>Ver todo el camino →</button></div><div class="course-filters"><label>Buscar una lección<input id="course-search" type="search" placeholder="Una nota, un acorde, una técnica…" value="${esc(query)}"></label><div class="filter-row"><button class="chip ${level === -1 ? "active" : ""}" data-filter="-1" aria-pressed="${level === -1}">Todas las etapas</button>${levels.map((l, i) => `<button class="chip ${level === i ? "active" : ""}" data-filter="${i}" aria-pressed="${level === i}">${i + 1}. ${l.name}</button>`).join("")}</div></div>
    <details class="path-explore" ${domain !== "all" ? "open" : ""}><summary>Explorar por área · opcional</summary><p class="hint">Si estás empezando, seguí los bloques en orden. Estos filtros sirven para buscar o repasar.</p><div class="domain-grid"><button class="chip ${domain === "all" ? "active" : ""}" data-course-domain="all" aria-pressed="${domain === "all"}">Todas las áreas</button>${studyDomains
      .map((d) => {
        const p = domainProgress(state, lessons, d.id);
        return `<button class="domain-card ${domain === d.id ? "selected" : ""}" data-course-domain="${d.id}" aria-pressed="${domain === d.id}"><strong>${d.name}</strong><small>${p.total} lecciones · ${p.practiced} en práctica</small></button>`;
      })
      .join("")}</div></details>
    <p class="hint" id="course-count" role="status"></p><div id="course-results">${courseResults({ state, lessons, levels, level, domain, query })}</div></section>
    <section class="panel path-note"><h2>Avanzar también es volver a practicar.</h2><p>Completá la explicación, el ejercicio, la pregunta y el reto antes de pasar a la siguiente lección. Podés abrir cualquier paso para repasar o explorar.</p><p class="hint">Completar una lección registra práctica y comprensión. Afianzar su ejercicio MIDI requiere tres tomas con pulso, sin nombres, en dos días: 95% de alturas y 90% de entradas y duraciones. MIDI no evalúa postura ni expresión; estos criterios no certifican un nivel musical.</p></section>`;
}
export function courseResults({
  state,
  lessons,
  levels,
  level = -1,
  domain = "all",
  query = "",
}) {
  const normalized = query
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  const filtered = lessons.filter(
    (l) =>
      (level === -1 || l.level === level) &&
      (domain === "all" || lessonDomain(l) === domain) &&
      `${l.title} ${l.topics.join(" ")} ${l.subtitle}`
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .includes(normalized),
  );
  if (!filtered.length)
    return '<div class="panel library-empty"><h3>No hay lecciones con esos filtros.</h3><p>Probá otra palabra o elegí todas las etapas.</p><button class="text-button" data-course-reset>Limpiar búsqueda</button></div>';
  const next = nextPathLesson(state, lessons);
  return courseChapters
    .filter((chapter) => filtered.some((l) => chapter.ids.includes(l.id)))
    .map((chapter) => {
      const index = courseChapters.indexOf(chapter);
      const list = filtered.filter((l) => chapter.ids.includes(l.id));
      const done = chapter.ids.filter((id) =>
        state.completed.includes(id),
      ).length;
      const current = chapter.ids.includes(next?.id);
      return `<details class="course-domain path-chapter ${current ? "is-current" : ""}" ${current || domain !== "all" || query || level !== -1 ? "open" : ""}><summary><span class="domain-index">${String(index + 1).padStart(2, "0")}</span><div><span class="eyebrow">${esc(levels[chapter.level].name)}${current ? " · ESTÁS ACÁ" : ""}</span><h2>${esc(chapter.title)}</h2><p>${esc(chapter.description)}</p></div><span class="course-domain-count">${done}/${chapter.ids.length}<b>＋</b></span></summary><div class="lesson-list">${list
        .map((l) => {
          const status = evidenceStatus(state, l.id);
          const completed = state.completed.includes(l.id);
          return `<button class="lesson-row ${l.id === next?.id ? "is-next" : ""} ${completed ? "is-complete" : ""}" data-lesson="${l.id}" ${l.id === next?.id ? 'aria-current="step"' : ""}><span class="lesson-number">${String(lessons.indexOf(l) + 1).padStart(2, "0")}</span><span><strong>${esc(l.title)}</strong><small>${l.minutes} min · ${esc(l.topics.join(" · "))}</small></span><span class="lesson-state ${status.kind}">${completed ? "Completada ✓" : l.id === next?.id ? "Tu próximo paso" : status.kind === "new" ? "Por empezar" : status.label}</span><span class="row-arrow">→</span></button>`;
        })
        .join("")}</div></details>`;
    })
    .join("");
}
export function bindCourse(options) {
  const input = document.querySelector("#course-search");
  if (!input) return;
  const draw = () => {
    const query = input.value;
    options.onQuery(query);
    const params = { ...options, query };
    document.querySelector("#course-results").innerHTML = courseResults(params);
    const total = document.querySelectorAll(
      "#course-results [data-lesson]",
    ).length;
    document.querySelector("#course-count").textContent =
      `${total} lecciones${options.domain !== "all" || query || options.level !== -1 ? " con estos filtros" : " en orden"} · la numeración siempre sigue el recorrido.`;
  };
  input.oninput = draw;
  draw();
}
