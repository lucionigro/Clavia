/** IndexedDB almacena arreglos importados sin llenar el progreso en localStorage. */
let connection;
function database() {
  return (connection ||= new Promise((resolve, reject) => {
    const req = indexedDB.open("clavia-library", 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore("pieces", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      connection = null;
      reject(Error("No se pudo abrir el repertorio local."));
    };
  }));
}
export async function libraryRequest(action, value) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      "pieces",
      action === "getAll" ? "readonly" : "readwrite",
    );
    const store = tx.objectStore("pieces");
    const req =
      action === "putMany"
        ? null
        : store[action](...(value === undefined ? [] : [value]));
    if (action === "putMany") for (const item of value) store.put(item);
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () =>
      reject(
        Error(
          "No se pudo guardar el repertorio. Exportá una copia y liberá espacio.",
        ),
      );
    tx.onabort = () => reject(Error("Guardado cancelado."));
  });
}
export function validateImportedPiece(p) {
  if (
    !p ||
    typeof p.id !== "string" ||
    !/^import-[a-z0-9-]{1,80}$/.test(p.id) ||
    typeof p.title !== "string" ||
    !p.title.trim() ||
    p.title.length > 100 ||
    typeof p.artist !== "string" ||
    p.artist.length > 100
  )
    throw Error("Pieza inválida.");
  const s = p.score;
  if (
    !s ||
    ![2, 3, 4, 4.5, 6].includes(s.meter) ||
    !Number.isInteger(s.bars) ||
    s.bars < 1 ||
    s.bars > 128 ||
    !Array.isArray(s.notes) ||
    !s.notes.length ||
    s.notes.length > 5000
  )
    throw Error("Partitura inválida.");
  const ids = new Set();
  const notes = s.notes.map((n, i) => {
    if (
      !Number.isInteger(n.pitch) ||
      n.pitch < 21 ||
      n.pitch > 108 ||
      !Number.isFinite(n.start) ||
      n.start < 0 ||
      Math.abs(n.start * 24 - Math.round(n.start * 24)) > 1e-5 ||
      !Number.isFinite(n.duration) ||
      n.duration < 1 / 24 - 1e-7 ||
      Math.abs(n.duration * 24 - Math.round(n.duration * 24)) > 1e-5 ||
      n.start + n.duration > s.bars * s.meter + 1e-5 ||
      !["left", "right"].includes(n.hand)
    )
      throw Error("Nota inválida.");
    const id = `import-note-${i}`;
    ids.add(id);
    return {
      ...(typeof n.label === "string" &&
      /^(Do|Re|Mi|Fa|Sol|La|Si)[♯♭]{0,2}-?\d$/.test(n.label)
        ? { label: n.label }
        : {}),
      ...(Number.isInteger(n.finger) && n.finger >= 1 && n.finger <= 5
        ? { finger: n.finger }
        : {}),
      ...(n.tuplet === 3 ? { tuplet: 3 } : {}),
      id,
      pitch: n.pitch,
      start: Math.round(n.start * 24) / 24,
      duration: Math.round(n.duration * 24) / 24,
      hand: n.hand,
    };
  });
  const held = new Map();
  for (const n of [...notes].sort((a, b) => a.start - b.start)) {
    const prev = held.get(n.pitch);
    if (prev && prev.start + prev.duration > n.start + 1e-5)
      throw Error("Notas duplicadas o superpuestas.");
    held.set(n.pitch, n);
  }
  return {
    id: p.id,
    title: p.title,
    artist: p.artist,
    level: ["Principiante", "Inicial", "Intermedio", "Avanzado"].includes(
      p.level,
    )
      ? p.level
      : "Intermedio",
    style: p.format === "musicxml" ? "Mi partitura" : "Mi MIDI",
    format: p.format === "musicxml" ? "musicxml" : "midi",
    detail: "Archivo propio · guardado en este equipo",
    bpm: Math.max(30, Math.min(140, Math.round((p.bpm || 60) / 5) * 5)),
    catalogId: typeof p.catalogId === "string" ? p.catalogId.slice(0, 80) : "",
    score: {
      title: p.title,
      description:
        "Arreglo importado · guía de práctica. Verificá la asignación de manos y las duraciones con tu partitura.",
      meter: s.meter,
      timeSignature:
        ["2/4", "3/4", "4/4", "6/8", "9/8", "12/8"].includes(s.timeSignature) &&
        (Number(s.timeSignature.split("/")[0]) * 4) /
          Number(s.timeSignature.split("/")[1]) ===
          s.meter
          ? s.timeSignature
          : `${s.meter}/4`,
      bars: s.bars,
      notes,
    },
  };
}
