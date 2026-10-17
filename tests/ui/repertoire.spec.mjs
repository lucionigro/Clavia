import { test, expect } from "@playwright/test";
const bytes = () => {
  const d = [
    0, 255, 88, 4, 3, 2, 24, 8, 0, 144, 48, 90, 0, 144, 60, 90, 131, 96, 128,
    60, 0, 0, 144, 62, 90, 131, 96, 128, 62, 0, 131, 96, 128, 48, 0, 0, 255, 47,
    0,
  ];
  return Buffer.from([
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
    0,
    0,
    0,
    d.length,
    ...d,
  ]);
};
test("Catálogo, filtros, favoritos, dos manos, importación y persistencia local", async ({
  page,
  browser,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#library");
  await page.locator("[data-setup-later]").click();
  await expect(page.locator(".repertoire-card")).toHaveCount(15);
  await page.locator('[data-favorite="primeras-luces"]').click();
  await page.locator('[data-library-kind="favorites"]').click();
  await expect(page.locator(".repertoire-card")).toHaveCount(1);
  await page.locator('[data-library-kind="songs"]').click();
  await expect(page.locator(".repertoire-card")).toHaveCount(24);
  await page.locator("#library-query").fill("garcia");
  await expect(page.locator(".repertoire-card")).toHaveCount(5);
  await page.locator("#library-query").fill("");
  await page.locator("#library-artist").selectOption("The Beatles");
  await expect(page.locator(".repertoire-card")).toHaveCount(4);
  await page.locator('[data-library-open="beatles-let"]').click();
  await expect(page.locator("#lesson-dialog")).toBeVisible();
  await expect(page.locator("#lesson-title")).toHaveText("Let It Be");
  await expect(page.locator("#piece-exercise")).toHaveCount(0);
  await page.locator(".close").click();
  await page.locator('[data-library-kind="ready"]').click();
  await page.locator('[data-library-open="primeras-luces"]').click();
  await expect(page.locator(".score-note.left").first()).toBeVisible();
  await expect(page.locator(".score-note.right").first()).toBeVisible();
  await expect(page.locator("#coach-hand")).toHaveValue("both");
  await page.locator('[data-coach-mode="step"]').click();
  await page.locator("[data-coach-play]").click();
  await page.locator('.coach-keyboard .key[data-note="61"]').click();
  await expect(page.locator(".coach-instruction")).toContainText("Sonó");
  await page.locator(".close").click();
  await page.locator("[data-import-midi]").click();
  await page.locator("#midi-upload").setInputFiles({
    name: "Estudio de prueba.mid",
    mimeType: "audio/midi",
    buffer: bytes(),
  });
  await expect(page.locator("#save-midi")).toBeVisible();
  await page.locator("#midi-title").fill("Mi prueba en tres");
  await page.locator("#save-midi").click();
  await expect(page.locator("#piece-exercise")).toBeVisible();
  await expect(page.locator("#lesson-title")).toHaveText("Mi prueba en tres");
  await expect(page.locator(".score-note.left").first()).toBeVisible();
  await expect(page.locator(".guided-score")).toHaveAttribute(
    "aria-label",
    /Compás de 3 por cuatro/,
  );
  await page.locator(".coach-settings summary").click();
  await page.locator("#coach-bpm").fill("120");
  await page.locator('[data-coach-mode="step"]').click();
  await page.locator("[data-coach-play]").click();
  await page.keyboard.down("a");
  await page.keyboard.down("k");
  await page.waitForTimeout(520);
  await page.keyboard.up("k");
  await page.keyboard.down("l");
  await page.waitForTimeout(520);
  await page.keyboard.up("l");
  await page.waitForTimeout(520);
  await page.keyboard.up("a");
  await expect(page.locator(".coach-results")).toContainText("3 de 3");
  await expect(page.locator(".coach-score")).toHaveText("100%");
  await page.locator(".close").click();
  await page.locator('[data-library-kind="imports"]').click();
  await expect(page.locator(".repertoire-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".repertoire-card")).toHaveCount(16);
  await page.locator('[data-library-kind="imports"]').click();
  await expect(page.locator(".repertoire-card")).toHaveCount(1);
  await expect(page.locator(".repertoire-card h2")).toHaveText(
    "Mi prueba en tres",
  );
  await expect(page.locator(".piece-footer small")).toContainText(
    "completa a dos manos",
  );
  await page.locator("[data-library-backup]").click();
  await page.locator('[data-library-kind="ready"]').click();
  await page.screenshot({
    path: "artifacts/repertorio-desktop.png",
    fullPage: true,
  });
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await page.screenshot({ path: "artifacts/repertorio-mobile.png" });
  await page.goto("/#settings");
  const backupPromise = page.waitForEvent("download");
  await page.locator("#export-progress").click();
  const backup = await backupPromise;
  const backupPath = await backup.path();
  const restored = await browser.newPage();
  restored.on("dialog", (dialog) => dialog.accept());
  try {
    await restored.goto("http://localhost:4173/#settings");
    await restored.locator("[data-setup-later]").click();
    await restored.locator("#import-file").setInputFiles(backupPath);
    await expect(restored.locator("#toast")).toContainText(
      "Tu progreso ya está acá",
    );
    await restored.locator('[data-page="library"]').click();
    await restored.locator('[data-library-kind="imports"]').click();
    await expect(restored.locator(".repertoire-card h2")).toHaveText(
      "Mi prueba en tres",
    );
    await expect(restored.locator(".piece-footer small")).toContainText(
      "completa a dos manos",
    );
    await restored.locator('[data-library-kind="favorites"]').click();
    await expect(restored.locator(".repertoire-card h2")).toHaveText(
      "Primeras luces",
    );
  } finally {
    await restored.close();
  }
  expect(errors).toEqual([]);
});
