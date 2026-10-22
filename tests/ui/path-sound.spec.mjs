import { test, expect } from "@playwright/test";

test("Un principiante ve un camino numerado, consistente y sin saltos entre áreas", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("[data-setup-later]").click();
  await expect(
    page.locator(".daily-plan [data-lesson]").first(),
  ).toHaveAttribute("data-lesson", "mapa");
  await page.locator('[data-page="course"]').first().click();
  await expect(page.locator(".path-continue [data-lesson]")).toHaveAttribute(
    "data-lesson",
    "mapa",
  );
  await expect(page.locator(".path-chapter[open]")).toHaveCount(1);
  await expect(
    page.locator('.lesson-row[aria-current="step"]'),
  ).toHaveAttribute("data-lesson", "mapa");
  await expect(
    page.locator(".path-chapter").first().locator(".lesson-number"),
  ).toHaveText(["01", "02", "03", "04", "05"]);
  await page.locator(".path-continue [data-lesson]").click();
  await expect(page.locator(".dialog-head .eyebrow")).toContainText(
    "PASO 1 DE 82",
  );
  await page.locator(".close").click();
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/path-${width}.png`,
      fullPage: true,
    });
  }
});

test("Sonidos seleccionables, piano local decodificable, cancelación y preferencia persistente", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator("[data-setup-next]").click();
  await page.locator("[data-setup-next]").click();
  await expect(page.locator("#setup-tone")).toHaveValue("grand");
  await page.locator("#setup-tone").selectOption("soft");
  await page.locator("[data-setup-next]").click();
  await page.locator(".header-settings").click();
  await expect(page.locator("[data-sound-preset]")).toHaveValue("soft");
  await page.locator("[data-sound-preset]").selectOption("grand");
  await page.locator("[data-sound-preview]").click();
  await page.waitForTimeout(300);
  await expect(page.locator("#toast")).not.toContainText("No se pudo cargar");
  const audio = await page.evaluate(async () => {
    const { pianoSamples, nearestSample, KeyboardSound } =
      await import("/sound.js");
    const ctx = new AudioContext();
    const bank = new KeyboardSound(ctx);
    const buffers = await bank.prepare();
    const results = [];
    for (const preset of ["grand", "soft", "electric", "organ"]) {
      const offline = new OfflineAudioContext(1, 44100, 44100);
      const instrument = new KeyboardSound(offline);
      pianoSamples.forEach((sample, i) =>
        instrument.buffers.set(sample.name, Promise.resolve(buffers[i])),
      );
      const voice = instrument.start(60, 0.8, 0.5, preset);
      await Promise.resolve();
      await Promise.resolve();
      const rendered = await offline.startRendering();
      const data = rendered.getChannelData(0);
      const peak = data.reduce((n, x) => Math.max(n, Math.abs(x)), 0);
      results.push({ preset, peak });
      voice.stop();
    }
    // Una nota soltada antes de terminar la carga nunca debe sonar tarde.
    const silent = new OfflineAudioContext(1, 4410, 44100);
    const pending = new KeyboardSound(silent);
    let resolve;
    pending.buffers.set(
      nearestSample(60).name,
      new Promise((r) => {
        resolve = r;
      }),
    );
    const voice = pending.start(60, 1, 1);
    voice.stop();
    resolve(buffers[pianoSamples.findIndex((s) => s.pitch === 60)]);
    await Promise.resolve();
    const rendered = await silent.startRendering();
    const silentPeak = rendered
      .getChannelData(0)
      .reduce((n, x) => Math.max(n, Math.abs(x)), 0);
    await ctx.close();
    return { results, silentPeak, samples: buffers.length };
  });
  expect(audio.samples).toBe(30);
  for (const sound of audio.results) {
    expect(sound.peak, sound.preset).toBeGreaterThan(0.001);
    expect(sound.peak, sound.preset).toBeLessThanOrEqual(1);
  }
  expect(audio.silentPeak).toBe(0);
  await page.locator("[data-sound-preset]").selectOption("electric");
  await page.reload();
  await expect(page.locator("[data-sound-preset]")).toHaveValue("electric");
  await page.context().setOffline(true);
  await page.locator("[data-sound-preview]").click();
  await expect(page.locator("#toast")).not.toContainText("No se pudo cargar");
  expect(errors).toEqual([]);
});
