import { test, expect, _electron as electron } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
test("La app empaquetada abre sin servidor, admite MIDI y conserva progreso al reiniciar", async () => {
  test.skip(
    process.env.CLAVIA_DESKTOP !== "1",
    "Ejecutar después de package:mac con CLAVIA_DESKTOP=1",
  );
  const profile = mkdtempSync(path.join(os.tmpdir(), "clavia-desktop-"));
  const launch = () =>
    electron.launch({
      executablePath: path.resolve(
        "dist/mac-arm64/Clavia.app/Contents/MacOS/Clavia",
      ),
      env: { ...process.env, CLAVIA_TEST_PROFILE: profile },
    });
  let desktop;
  try {
    desktop = await launch();
    let page = await desktop.firstWindow();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await expect(page).toHaveTitle(/Clavia/);
    await page.locator("[data-setup-later]").click();
    expect(page.url()).toMatch(/^clavia:\/\/app\/index.html/);
    await page.locator("#midi-button").click();
    expect(
      await page.evaluate(
        async () =>
          (await navigator.requestMIDIAccess({ sysex: false })).sysexEnabled,
      ),
    ).toBe(false);
    await expect(page.locator("#midi-button")).toContainText(
      /Buscar teclado|MIDI conectado/,
    );
    await expect(page.locator("#toast")).not.toContainText(
      "No se pudo conectar",
    );
    await page.locator('[data-page="library"]').first().click();
    await expect(page.locator(".repertoire-card")).toHaveCount(15);
    await page.locator('[data-favorite="primeras-luces"]').click();
    await page.locator('[data-library-open="primeras-luces"]').click();
    await expect(page.locator(".score-note.left").first()).toBeVisible();
    await expect(page.locator(".score-note.right").first()).toBeVisible();
    await page.locator("[data-coach-focus]").click();
    await page.screenshot({ path: "artifacts/clavia-app-dos-manos.png" });
    await page.locator("[data-coach-focus]").click();
    await page.locator(".close").click();
    expect(
      await page.evaluate(() => ({
        secure: isSecureContext,
        node: typeof window.require,
      })),
    ).toEqual({ secure: true, node: "undefined" });
    expect(errors).toEqual([]);
    await page.locator("[data-import-midi]").click();
    await page
      .locator("#midi-upload")
      .setInputFiles("examples/primer-dialogo.musicxml");
    await expect(page.locator("#save-midi")).toBeVisible();
    await page.locator("#save-midi").click();
    await expect(page.locator("#lesson-title")).toHaveText("Primer diálogo");
    await expect(page.locator(".falling-note.left")).toHaveCount(4);
    await page.locator(".close").click();
    await page.context().setOffline(true);
    await page.reload();
    await expect(page.locator(".repertoire-card")).toHaveCount(16);
    await desktop.close();
    desktop = await launch();
    page = await desktop.firstWindow();
    await page.locator('[data-page="library"]').first().click();
    await page.locator('[data-library-kind="favorites"]').click();
    await expect(page.locator(".repertoire-card h2")).toHaveText(
      "Primeras luces",
    );
    await page.locator('[data-library-kind="imports"]').click();
    await expect(page.locator(".repertoire-card h2")).toHaveText(
      "Primer diálogo",
    );
  } finally {
    if (desktop) await desktop.close();
    rmSync(profile, { recursive: true, force: true });
  }
});
