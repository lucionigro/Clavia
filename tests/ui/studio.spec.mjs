import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { zipSync, strToU8 } from "fflate";
import { parseMIDI } from "../../midi-file.js";
const skip = async (p) => {
  await p.locator("[data-setup-later]").click();
};
test("Configuración personal, recorrido clásico, búsqueda y adaptación a tamaños", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#setup-title")).toHaveText("¿Qué teclado tenés?");
  await page.locator("#setup-keys").selectOption("49");
  await page.locator("#setup-model").fill("Mi teclado de estudio");
  await page.locator("[data-setup-next]").click();
  await page.locator("#setup-focus").selectOption("classical");
  await page.locator("#setup-goal").selectOption("20");
  await page.locator("[data-setup-next]").click();
  await expect(page.locator("#setup-title")).toHaveText(
    "Que Clavia te escuche.",
  );
  await page.locator("[data-setup-next]").click();
  await expect(page.locator(".daily-plan")).toContainText("20 MINUTOS");
  await page.locator('[data-page="course"]').first().click();
  await expect(page.locator(".course-total")).toContainText("82");
  await expect(page.locator(".domain-card")).toHaveCount(8);
  await page.locator('[data-course-domain="classical"]').first().click();
  await page.locator("#course-search").fill("Alberti");
  await expect(
    page.locator('#course-results [data-lesson="am-bajo-alberti"]'),
  ).toBeVisible();
  await page.locator('[data-lesson="am-bajo-alberti"]').click();
  await expect(page.locator(".lesson-objective")).toBeVisible();
  await page.locator("#lesson-next").click();
  await expect(page.locator(".score-note.left").first()).toBeVisible();
  await expect(page.locator(".score-note.right").first()).toBeVisible();
  await page.locator("[data-coach-focus]").click();
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "artifacts/clasica-atril.png" });
  await page.locator("[data-coach-focus]").click();
  await page.locator(".close").click();
  await page.locator(".header-settings").click();
  await expect(page.locator(".instrument-settings")).toContainText("49 teclas");
  expect(errors).toEqual([]);
});
test("MusicXML y MXL crean partitura y guía de teclado; un PDF recibe instrucciones claras", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#library");
  await skip(page);
  await page.locator("[data-import-midi]").click();
  await page
    .locator("#midi-upload")
    .setInputFiles({
      name: "pagina.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7"),
    });
  await expect(page.locator("#midi-import-status")).toContainText(
    "reconocimiento óptico",
  );
  await page
    .locator("#midi-upload")
    .setInputFiles("examples/primer-dialogo.musicxml");
  await expect(page.locator("#save-midi")).toBeVisible();
  await expect(page.locator('[data-track="0"]')).toHaveValue("right");
  await expect(page.locator('[data-track="1"]')).toHaveValue("left");
  await page.locator("#preview-score").click();
  await expect(
    page.locator("#import-score-preview .score-note.left").first(),
  ).toBeVisible();
  await page.locator("#save-midi").click();
  await expect(page.locator("#lesson-title")).toHaveText("Primer diálogo");
  await expect(page.locator(".coach-keyboard .piano")).toBeVisible();
  await expect(page.locator(".falling-note.left")).toHaveCount(4);
  await expect(page.locator(".falling-note.right")).toHaveCount(13);
  await page.locator(".close").click();
  await page.locator("[data-import-midi]").click();
  const xml = readFileSync("examples/primer-dialogo.musicxml", "utf8"),
    container =
      '<container><rootfiles><rootfile full-path="score.musicxml" media-type="application/vnd.recordare.musicxml+xml"/></rootfiles></container>';
  const zip = zipSync({
    "META-INF/container.xml": strToU8(container),
    "score.musicxml": strToU8(xml),
  });
  await page
    .locator("#midi-upload")
    .setInputFiles({
      name: "estudio.mxl",
      mimeType: "application/vnd.recordare.musicxml",
      buffer: Buffer.from(zip),
    });
  await expect(page.locator("#save-midi")).toBeVisible();
  await page.locator("#midi-title").fill("Mi partitura comprimida");
  await page.locator("#save-midi").click();
  await expect(page.locator("#lesson-title")).toHaveText(
    "Mi partitura comprimida",
  );
  await page.locator(".close").click();
  await page.locator('[data-library-kind="imports"]').click();
  await expect(page.locator(".repertoire-card")).toHaveCount(2);
  expect(errors).toEqual([]);
});
test("Improvisación: acompañamiento, toma propia, exportación MIDI y cuaderno privado", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#practice");
  await skip(page);
  await page.locator('[data-tool="improv"]').click();
  await page.locator("#improv-bpm").fill("120");
  await page.locator("[data-improv-start]").click();
  await expect(page.locator("[data-improv-position]")).toContainText("Compás", {
    timeout: 5000,
  });
  for (const key of ["k", "l", ";"]) {
    await page.keyboard.down(key);
    await page.waitForTimeout(150);
    await page.keyboard.up(key);
  }
  await page.locator("[data-improv-stop]").click();
  await expect(page.locator(".improv-metrics>span").first()).toContainText("3");
  const pending = page.waitForEvent("download");
  await page.locator("[data-improv-export]").click();
  const download = await pending,
    path = await download.path(),
    buffer = readFileSync(path);
  const parsed = parseMIDI(
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ),
  );
  expect(parsed.tracks[0].notes).toHaveLength(3);
  await page.locator('[data-page="progress"]').click();
  await expect(page.locator(".creative-count")).toHaveText("1");
  await page
    .locator("#journal-text")
    .fill("Hoy dejé espacio entre las frases.");
  await page.locator("#journal-form button").click();
  await expect(page.locator(".journal-entries")).toContainText(
    "Hoy dejé espacio",
  );
  await page.reload();
  await expect(page.locator(".journal-entries")).toContainText(
    "Hoy dejé espacio",
  );
  expect(errors).toEqual([]);
});
test("Oído activo oculta las notas durante la escucha y cancela tareas al navegar", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#practice");
  await skip(page);
  await page.locator('[data-tool="ear"]').click();
  await page.locator("[data-aural-listen]").click();
  await expect(page.locator(".aural-answer")).toHaveCount(0);
  await expect(page.locator(".aural-status")).toContainText("Ahora tocá", {
    timeout: 5000,
  });
  for (const key of ["a", "s", "d"]) {
    await page.keyboard.press(key);
  }
  await expect(page.locator(".aural-status")).toContainText(
    "Tu respuesta de oído",
  );
  await page.locator("[data-aural-reveal]").click();
  await expect(page.locator(".aural-answer")).toBeVisible();
  await page.locator("[data-aural-new]").click();
  await page.locator("[data-aural-listen]").click();
  await page.locator('[data-page="home"]').first().click();
  await expect(page.locator(".daily-plan")).toBeVisible();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});
