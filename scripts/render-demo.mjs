/** Postproducción reproducible: cámara, subtítulos y una base original sintetizada. */
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
const folder = path.resolve("artifacts/demo"),
  rawManifest = JSON.parse(
    await readFile(path.join(folder, "manifest.json"), "utf8"),
  );
const trimStart = (rawManifest.scenes[0]?.start || 0) + 0.18;
const manifest = {
  ...rawManifest,
  duration: rawManifest.duration - trimStart,
  scenes: rawManifest.scenes.map((s) => ({
    ...s,
    start: Math.max(0, s.start - trimStart),
    end: s.end - trimStart,
  })),
  camera: [
    { t: 0, z: 1, x: 0.5, y: 0.5 },
    ...rawManifest.camera
      .filter((p) => p.t > trimStart)
      .map((p) => ({ ...p, t: p.t - trimStart })),
  ],
};
await mkdir("dist", { recursive: true });
const font =
  process.env.DEMO_FONT ||
  [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "C:/Windows/Fonts/arial.ttf",
  ].find(existsSync);
if (!font) throw Error("Indicá DEMO_FONT con una fuente TTF local.");
const frames = Math.ceil(manifest.duration * 30),
  points = manifest.camera.sort((a, b) => a.t - b.t);
points.push({ t: manifest.duration + 1, z: 1, x: 0.5, y: 0.5 });
function curve(property) {
  let expression = String(points.at(-1)[property]);
  for (let i = points.length - 2; i >= 0; i--) {
    const a = points[i],
      b = points[i + 1],
      start = Math.round(a.t * 30),
      end = Math.max(start + 1, Math.round(b.t * 30)),
      from = a[property],
      to = b[property];
    const value =
      from === to
        ? String(from)
        : `${from}+(${to - from})*(.5-.5*cos(PI*(on-${start})/${end - start}))`;
    expression = `if(lt(on,${end}),${value},${expression})`;
  }
  return expression;
}
const z = curve("z"),
  x = curve("x"),
  y = curve("y"),
  escapeFilter = (s) =>
    s.replaceAll("\\", "/").replaceAll(":", "\\:").replaceAll("'", "\\'");
// Una progresión y arpegios originales, sin grabaciones comerciales ni micrófono.
const sampleRate = 44100,
  length = Math.ceil((manifest.duration + 1) * sampleRate),
  samples = new Float32Array(length),
  beat = 60 / 72,
  chords = [
    [48, 52, 55],
    [45, 48, 52],
    [41, 45, 48],
    [43, 47, 50],
  ];
function tone(pitch, start, duration, amplitude) {
  const frequency = 440 * 2 ** ((pitch - 69) / 12),
    first = Math.max(0, Math.floor(start * sampleRate)),
    count = Math.min(length - first, Math.floor((duration + 1) * sampleRate));
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate,
      envelope =
        Math.min(1, t / 0.012) *
        Math.exp(-t * 2.8) *
        (t > duration ? Math.exp(-(t - duration) * 9) : 1);
    samples[first + i] +=
      amplitude *
      envelope *
      (Math.sin(2 * Math.PI * frequency * t) +
        0.22 * Math.sin(4 * Math.PI * frequency * t) +
        0.06 * Math.sin(6 * Math.PI * frequency * t));
  }
}
for (let bar = 0; bar * 4 * beat < manifest.duration; bar++) {
  const chord = chords[bar % 4],
    start = bar * 4 * beat;
  tone(chord[0], start, 3.6 * beat, 0.11);
  for (let i = 0; i < 8; i++)
    tone(
      chord[[0, 2, 1, 2][i % 4]] + 12,
      start + i * 0.5 * beat,
      0.8 * beat,
      0.06,
    );
}
const wav = Buffer.alloc(44 + length * 2);
wav.write("RIFF");
wav.writeUInt32LE(36 + length * 2, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(length * 2, 40);
for (let i = 0; i < length; i++)
  wav.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767),
    44 + i * 2,
  );
const audio = path.join(folder, "original-piano.wav");
await writeFile(audio, wav);
const filters = [
  "fps=30",
  "scale=1920:1080:flags=lanczos",
  `zoompan=z='${z}':x='max(0,min(iw-iw/zoom,iw*(${x})-iw/(2*zoom)))':y='max(0,min(ih-ih/zoom,ih*(${y})-ih/(2*zoom)))':d=1:s=1920x1080:fps=30`,
];
let index = 0;
for (const scene of manifest.scenes) {
  if (!scene.caption) continue;
  const caption = path.join(folder, `caption-${index}.txt`),
    title = path.join(folder, `title-${index}.txt`);
  await writeFile(caption, scene.caption);
  await writeFile(title, scene.title);
  const enable = `between(t,${scene.start},${scene.end})`;
  filters.push(
    `drawbox=x=44:y=932:w=1832:h=113:color=0x203c2f@0.94:t=fill:enable='${enable}'`,
    `drawtext=fontfile='${escapeFilter(font)}':textfile='${escapeFilter(title)}':fontsize=17:fontcolor=0xc7d9b0:x=75:y=952:enable='${enable}'`,
    `drawtext=fontfile='${escapeFilter(font)}':textfile='${escapeFilter(caption)}':fontsize=30:fontcolor=0xfffdf1:x=75:y=985:enable='${enable}'`,
  );
  index++;
}
filters.push(
  `drawtext=fontfile='${escapeFilter(font)}':text='Sesión de demostración · teclado virtual':fontsize=15:fontcolor=0x294e42:box=1:boxcolor=0xf7f6ee@0.9:boxborderw=8:x=w-tw-40:y=30`,
);
const graph = path.join(folder, "filtergraph.txt");
await writeFile(graph, filters.join(","));
const output = path.resolve("dist/Clavia-demo.mp4");
function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, args, {
      stdio: ["ignore", "inherit", "inherit"],
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(Error(`FFmpeg terminó con código ${code}`)),
    );
  });
}
await run([
  "-y",
  "-hide_banner",
  "-loglevel",
  "warning",
  "-i",
  path.join(folder, manifest.raw),
  "-i",
  audio,
  "-filter_script:v",
  graph,
  "-af",
  `volume=0.6,afade=t=in:d=1.5,afade=t=out:st=${Math.max(0, manifest.duration - 2)}:d=2`,
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  "19",
  "-pix_fmt",
  "yuv420p",
  "-r",
  "30",
  "-c:a",
  "aac",
  "-b:a",
  "160k",
  "-t",
  String(manifest.duration),
  "-movflags",
  "+faststart",
  "-map_metadata",
  "-1",
  "-metadata",
  "title=Clavia — Tu música, a tu ritmo",
  "-metadata",
  "comment=Demo con sesión aislada, teclado virtual y música original sintetizada",
  output,
]);
await run([
  "-y",
  "-hide_banner",
  "-loglevel",
  "error",
  "-ss",
  "2",
  "-i",
  output,
  "-frames:v",
  "1",
  "docs/media/demo-poster.jpg",
]);
for (const t of [
  0,
  Math.round(manifest.duration * 0.5),
  Math.max(0, Math.round(manifest.duration - 2)),
])
  await run([
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-ss",
    String(t),
    "-i",
    output,
    "-frames:v",
    "1",
    path.join(folder, `review-${t}.png`),
  ]);
await copyFile(output, path.join(folder, "Clavia-demo.mp4"));
console.log(
  JSON.stringify({
    output: "dist/Clavia-demo.mp4",
    seconds: manifest.duration,
    width: 1920,
    height: 1080,
    fps: 30,
    scenes: manifest.scenes.length,
    frames,
  }),
);
