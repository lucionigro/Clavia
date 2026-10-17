/** Captura solo una sesión nueva de Clavia. Nunca usa perfiles personales. */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const output = path.resolve("artifacts/demo");
await mkdir(output, { recursive: true });
await mkdir("docs/media", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    (process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : undefined),
});
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  recordVideo: { dir: output, size: { width: 1600, height: 900 } },
  deviceScaleFactor: 1,
});
await context.addInitScript(() => {
  const install = () => {
    if (document.querySelector("#demo-cursor")) return;
    const cursor = document.createElement("div");
    cursor.id = "demo-cursor";
    cursor.style.cssText =
      "position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;width:25px;height:32px;filter:drop-shadow(0 2px 3px #17301c55);transform:translate(800px,450px)";
    cursor.innerHTML =
      '<svg width="25" height="32" viewBox="0 0 25 32"><path d="M2 2v24l6-6 5 10 5-2-5-9h9Z" fill="#fffef5" stroke="#294e42" stroke-width="2" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(cursor);
    document.addEventListener("mousemove", (e) => {
      const target =
        [...document.querySelectorAll("dialog[open]")].at(-1) ||
        document.documentElement;
      if (cursor.parentElement !== target) target.appendChild(cursor);
      cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    });
    document.addEventListener("mousedown", () => {
      cursor.style.filter = "drop-shadow(0 0 7px #71984d)";
    });
    document.addEventListener("mouseup", () => {
      cursor.style.filter = "drop-shadow(0 2px 3px #17301c55)";
    });
  };
  document.addEventListener("DOMContentLoaded", install);
});
const started = Date.now();
const page = await context.newPage(),
  scenes = [],
  camera = [{ t: 0, z: 1, x: 0.5, y: 0.5 }];
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const time = () => Number(((Date.now() - started) / 1000).toFixed(3));
let pointer = { x: 800, y: 450 };
const pause = (ms) => page.waitForTimeout(ms);
async function move(locator) {
  await locator.waitFor({ state: "visible", timeout: 7000 });
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  if (!b) throw Error("Objetivo de demo invisible");
  const dest = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  for (let i = 1; i <= 16; i++) {
    const t = i / 16,
      eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
    await page.mouse.move(
      pointer.x + (dest.x - pointer.x) * eased,
      pointer.y + (dest.y - pointer.y) * eased,
    );
    await pause(22);
  }
  pointer = dest;
  return b;
}
async function click(locator) {
  await move(locator);
  await page.mouse.down();
  await pause(110);
  await page.mouse.up();
  await pause(240);
}
async function fill(locator, text) {
  await move(locator);
  await locator.click();
  await locator.fill("");
  await locator.pressSequentially(text, { delay: 50 });
  await pause(300);
}
async function zoom(locator, z = 1.16) {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  if (!b) return;
  const t = time(),
    x = (b.x + b.width / 2) / 1600,
    y = (b.y + b.height / 2) / 900;
  camera.push(
    { t, z: 1, x: 0.5, y: 0.5 },
    { t: t + 0.8, z, x, y },
    { t: t + 2.3, z, x, y },
    { t: t + 3.2, z: 1, x: 0.5, y: 0.5 },
  );
  await pause(3300);
}
async function scene(title, caption, fn, minSeconds = 7) {
  const start = time();
  console.log(`Demo: ${title}`);
  const entry = { title, caption, start };
  scenes.push(entry);
  try {
    await fn();
    const remainder = (minSeconds - (time() - start)) * 1000;
    if (remainder > 0) await pause(remainder);
  } catch (e) {
    await page.screenshot({ path: path.join(output, "recording-error.png") });
    throw e;
  }
  entry.end = time();
}
async function slate(outro = false) {
  await page.evaluate((outro) => {
    const d = document.createElement("dialog");
    d.id = "demo-slate";
    d.style.cssText =
      "width:100vw;max-width:none;height:100vh;max-height:none;inset:0;margin:0;padding:0;border:0;border-radius:0;outline:none;background:#f6f5ee;color:#294e42;";
    d.innerHTML = `<div style="height:100%;display:flex;flex-direction:column;justify-content:center;padding:100px 160px;position:relative;overflow:hidden"><span style="font:700 21px Manrope;letter-spacing:5px;margin-bottom:45px">TU ESPACIO PARA HACER MÚSICA</span><div style="font:800 105px Manrope;letter-spacing:-9px;line-height:1.2">clavia<span style="color:#99ad76">.</span></div><h2 style="font-size:86px;max-width:1000px;line-height:1.04;margin:32px 0 22px">${outro ? "Empezá por una nota." : "Tu música,<br>a tu ritmo."}</h2><p style="font:450 23px Manrope;color:#6b785e;max-width:900px">${outro ? "Descargá la app y hacé tuyo el próximo paso." : "Partituras, teclado e ideas que se convierten en música."}</p><div style="font:550 16px Manrope;letter-spacing:1px;margin-top:45px">${outro ? "github.com/lucionigro/Clavia" : "LECTURA &nbsp; · &nbsp; DOS MANOS &nbsp; · &nbsp; IMPROVISACIÓN"}</div><div style="position:absolute;right:-80px;top:110px;width:360px;height:650px;border:1px solid #d5dec9;border-radius:180px;transform:rotate(17deg);background:repeating-linear-gradient(90deg,#e4ebd8 0px,#e4ebd8 40px,#f6f5ee 40px,#f6f5ee 44px);opacity:.55;z-index:-1"></div></div>`;
    document.body.appendChild(d);
    d.showModal();
  }, outro);
}
try {
  await page.goto(process.env.DEMO_URL || "http://localhost:4173");
  await page.locator("#setup-dialog").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await scene(
    "",
    "",
    async () => {
      await slate();
      await pause(3800);
      await page.evaluate(() => {
        const d = document.querySelector("#demo-slate");
        d.close();
        d.remove();
      });
    },
    4.2,
  );
  await scene(
    "01 / TU INSTRUMENTO",
    "Elegí tus teclas, tu registro y la música que querés aprender.",
    async () => {
      await move(page.locator("#setup-keys"));
      await page.locator("#setup-keys").selectOption("61");
      await zoom(page.locator("#setup-keys"), 1.17);
      await click(page.locator("[data-setup-next]"));
      await move(page.locator("#setup-focus"));
      await page.locator("#setup-focus").selectOption("classical");
      await click(page.locator("[data-setup-next]"));
      await pause(700);
      await click(page.locator("[data-setup-next]"));
    },
    9,
  );
  await scene(
    "02 / UN POCO CADA DÍA",
    "Un plan que combina técnica, estudio, repertorio y creación.",
    async () => {
      await page.locator(".daily-plan").waitFor();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: "docs/media/clavia-home.png" });
      await zoom(page.locator(".daily-plan"), 1.14);
    },
    6,
  );
  await scene(
    "03 / TU RECORRIDO",
    "82 lecciones para leer, escuchar, interpretar y crear.",
    async () => {
      await click(page.locator('[data-page="course"]').first());
      await pause(500);
      await click(page.locator('.domain-card[data-course-domain="classical"]'));
      await fill(page.locator("#course-search"), "Alberti");
      await zoom(page.locator("#course-results"), 1.18);
      await click(page.locator('[data-lesson="am-bajo-alberti"]'));
    },
    9,
  );
  await scene(
    "04 / COMPRENDER Y TOCAR",
    "Una idea musical, una explicación y un ejemplo para tus dos manos.",
    async () => {
      await pause(900);
      await click(page.locator("#lesson-next"));
      await click(page.locator(".coach-settings summary"));
      await page.locator("#coach-bpm").fill("85");
      await click(page.locator(".coach-settings summary"));
      await click(page.locator("[data-coach-focus]"));
      await click(page.locator("[data-coach-play]"));
      await pause(3200);
      await zoom(page.locator(".coach-instrument"), 1.13);
      await page.screenshot({ path: "docs/media/clavia-cover.png" });
      await click(page.locator("[data-coach-play]"));
      await click(page.locator("[data-coach-focus]"));
      await click(page.locator("#lesson-dialog .close"));
    },
    11,
  );
  await scene(
    "05 / IMPROVISAR",
    "Un blues de doce compases. Vos elegís las notas y los silencios.",
    async () => {
      await click(page.locator('[data-page="practice"]').first());
      await click(page.locator('.tool-tabs [data-tool="improv"]'));
      await page.locator("#improv-style").selectOption("blues");
      await page.locator("#improv-bpm").fill("120");
      await click(page.locator("[data-improv-start]"));
      await page
        .locator("[data-improv-position]")
        .filter({ hasText: "Compás" })
        .waitFor({ timeout: 6000 });
      for (const key of ["k", ";", "c", ";", "l"]) {
        await page.keyboard.down(key);
        await pause(180);
        await page.keyboard.up(key);
        await pause(100);
      }
      await click(page.locator("[data-improv-stop]"));
      await zoom(page.locator(".improv-results"), 1.14);
    },
    11,
  );
  await scene(
    "06 / ENTRENAR EL OÍDO",
    "Escuchá ejemplos nuevos antes de ver su respuesta.",
    async () => {
      await click(page.locator('.tool-tabs [data-tool="ear"]'));
      await click(page.locator("[data-aural-listen]"));
      await page
        .locator(".aural-status")
        .filter({ hasText: "Ahora tocá" })
        .waitFor({ timeout: 6000 });
      await click(page.locator("[data-aural-reveal]"));
      await zoom(page.locator(".aural-response"), 1.12);
    },
    8,
  );
  await scene(
    "07 / TU REPERTORIO",
    "Guardá favoritos y prepará las canciones que querés estudiar.",
    async () => {
      await click(page.locator('[data-page="library"]').first());
      await click(page.locator('[data-library-kind="songs"]'));
      await fill(page.locator("#library-query"), "Charly");
      await zoom(page.locator("#library-results"), 1.12);
      await page.locator("#library-query").fill("");
      await click(page.locator('[data-library-kind="ready"]'));
    },
    8,
  );
  await scene(
    "08 / IMPORTAR UNA PARTITURA",
    "MusicXML y MXL conservan notas, ritmos, pentagramas y ligaduras.",
    async () => {
      await click(page.locator("[data-import-midi]"));
      await page
        .locator("#midi-upload")
        .setInputFiles("examples/primer-dialogo.musicxml");
      await page.locator("#save-midi").waitFor();
      await move(page.locator('[data-track="1"]'));
      await zoom(page.locator(".midi-tracks"), 1.18);
      await click(page.locator("#preview-score"));
      await pause(900);
      await click(page.locator("#save-midi"));
    },
    9,
  );
  await scene(
    "09 / LA PARTITURA COBRA VIDA",
    "La guía espera tus notas y comprueba cuánto las sostenés.",
    async () => {
      await click(page.locator(".coach-settings summary"));
      await page.locator("#coach-bpm").fill("120");
      await page.locator("#coach-to").selectOption("1");
      await click(page.locator(".coach-settings summary"));
      await click(page.locator('[data-coach-mode="step"]'));
      await click(page.locator("[data-coach-focus]"));
      await click(page.locator("[data-coach-play]"));
      await page.keyboard.down("a");
      for (const key of ["k", "l", ";", "c"]) {
        await page.keyboard.down(key);
        await pause(510);
        await page.keyboard.up(key);
      }
      await page.keyboard.up("a");
      await page.locator(".coach-results").waitFor();
      await zoom(page.locator(".coach-results"), 1.16);
      await click(page.locator("#lesson-dialog .close"));
    },
    11,
  );
  await scene(
    "10 / ESCUCHARTE Y VOLVER",
    "Un cuaderno privado para recordar qué salió y qué querés cambiar.",
    async () => {
      await click(page.locator('[data-page="progress"]').first());
      await fill(
        page.locator("#journal-text"),
        "Una melodía que respira, un bajo que sigue su camino.",
      );
      await click(page.locator("#journal-form button"));
      await zoom(page.locator(".journal-entries"), 1.14);
    },
    8,
  );
  await scene(
    "11 / TODO EN TU EQUIPO",
    "Sin cuentas ni micrófono. Conectá MIDI y exportá una copia completa.",
    async () => {
      await click(page.locator(".header-settings"));
      await zoom(page.locator(".instrument-settings"), 1.12);
      await move(page.locator("#export-progress"));
      await pause(500);
    },
    7,
  );
  await scene(
    "",
    "",
    async () => {
      await slate(true);
      await pause(4200);
    },
    4.5,
  );
  if (errors.length) throw Error(`Errores en la demo: ${errors.join("; ")}`);
  const duration = time(),
    video = page.video();
  await context.close();
  const raw = await video.path();
  await writeFile(
    path.join(output, "manifest.json"),
    JSON.stringify(
      {
        width: 1600,
        height: 900,
        duration,
        raw: path.basename(raw),
        scenes,
        camera,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ duration, scenes: scenes.length, errors: 0 }));
} finally {
  await browser.close();
}
