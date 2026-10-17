import {
  studyDomains,
  lessonDomain,
  domainProgress,
  evidenceStatus,
} from "./learning.js";
import { escapeHTML as esc } from "./repertoire.js";
const domainSymbols = {
  technique: "01",
  reading: "02",
  baroque: "03",
  classical: "04",
  ear: "05",
  improvisation: "06",
  harmony: "07",
  study: "08",
};
export function courseHTML({
  state,
  lessons,
  levels,
  level = -1,
  domain = "all",
  query = "",
}) {
  return `<div class="page-heading"><div><span class="eyebrow">ENTENDER · TOCAR · ESCUCHAR · CREAR</span><h1>Tu recorrido musical.</h1><p>Una formación amplia para tocar con más libertad y estudiar por tu cuenta.</p></div><span class="course-total">${lessons.length}<small>lecciones originales</small></span></div><section class="course-intro"><div><span class="eyebrow">LA MÚSICA TIENE MUCHAS PUERTAS</span><h2>Encontrá la tuya.<br>Después, abrí las demás.</h2><p>Desde leer tu primer Do hasta construir dos voces, acompañar una canción y desarrollar un solo. Cada idea tiene una práctica y un reto para llevar al instrumento.</p></div><div class="course-focus"><span>Para estudiar música clásica</span><h3>De las voces de una invención<br>al canto de una melodía.</h3><div class="controls"><button class="text-button" data-course-domain="baroque">Barroco y contrapunto ↗</button><button class="text-button" data-course-domain="classical">Clásico y romántico ↗</button></div><small>Articulación, fraseo, Alberti, forma, pedal y autoescucha.</small></div></section><div class="section-title"><h2>Ocho lenguajes. Un instrumento.</h2><button class="text-button" data-course-domain="all">Ver el recorrido completo →</button></div><div class="domain-grid">${studyDomains
    .map((d) => {
      const p = domainProgress(state, lessons, d.id);
      return `<button class="domain-card ${domain === d.id ? "selected" : ""}" data-course-domain="${d.id}" aria-pressed="${domain === d.id}"><span class="domain-index">${domainSymbols[d.id]}</span><strong>${d.name}</strong><small>${p.total} lecciones · ${p.practiced} en práctica</small><div class="progress-track"><span style="width:${(p.practiced / p.total) * 100}%"></span></div></button>`;
    })
    .join(
      "",
    )}</div><section class="course-browser"><div class="course-filters"><label>Encontrá una idea<input id="course-search" type="search" placeholder="Buscá Alberti, síncopa, arpegios…" value="${esc(query)}"></label><div class="filter-row"><button class="chip ${level === -1 ? "active" : ""}" data-filter="-1">Todas las etapas</button>${levels.map((l, i) => `<button class="chip ${level === i ? "active" : ""}" data-filter="${i}">${l.tag[0] + l.tag.slice(1).toLowerCase()}</button>`).join("")}</div></div><p class="hint" id="course-count" role="status"></p><div id="course-results">${courseResults({ state, lessons, levels, level, domain, query })}</div></section><section class="mastery-explainer"><div><span class="eyebrow">DEL «LO ENTIENDO» AL «PUEDO TOCARLO»</span><h2>Tu avance tiene evidencia.</h2><p>Completar una lección registra tu práctica y comprensión. Afianzar su ejercicio MIDI requiere tres tomas con pulso, sin nombres de notas, en dos días distintos.</p></div><ol><li><strong>Comprendé</strong><span>Leé, escuchá y resolvé la pregunta.</span></li><li><strong>Practicá</strong><span>Separá manos, compases y enlaces.</span></li><li><strong>Afianzá</strong><span>95% de alturas; 90% de entradas y duraciones.</span></li><li><strong>Escuchate</strong><span>Revisá fraseo, balance y comodidad.</span></li></ol><p class="hint">Son criterios propios para ejercicios, sin equivalencia con títulos. MIDI no determina qué dedos usaste, tensión, postura ni calidad acústica. La formación avanzada requiere obras completas, oído, práctica sostenida y devolución musical.</p></section>`;
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
  return studyDomains
    .filter((d) => filtered.some((l) => lessonDomain(l) === d.id))
    .map(
      (d, i) =>
        `<details class="course-domain" ${domain !== "all" || query || i === 0 ? "open" : ""}><summary><span class="domain-index">${domainSymbols[d.id]}</span><div><h2>${d.name}</h2><p>${d.description}</p></div><span class="course-domain-count">${filtered.filter((l) => lessonDomain(l) === d.id).length} lecciones <b>＋</b></span></summary><div class="lesson-list">${filtered
          .filter((l) => lessonDomain(l) === d.id)
          .map((l) => {
            const status = evidenceStatus(state, l.id);
            return `<button class="lesson-row" data-lesson="${l.id}"><span class="lesson-number">${String(lessons.indexOf(l) + 1).padStart(2, "0")}</span><span><strong>${esc(l.title)}</strong><small>${levels[l.level].tag} · ${l.minutes} min · ${esc(l.topics.join(" · "))}</small></span><span class="lesson-state ${status.kind}">${status.label}</span><span class="row-arrow">↗</span></button>`;
          })
          .join(
            "",
          )}</div><div class="domain-resources"><span>Para profundizar</span>${d.sourceLinks.map((link) => `<a class="source-link" href="${esc(link.url)}" target="_blank" rel="noreferrer">${esc(link.title)} ↗</a>`).join("")}</div></details>`,
    )
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
      `${total} lecciones encontradas · podés explorar todas las etapas y estudiar a tu ritmo.`;
  };
  input.oninput = draw;
  draw();
}
