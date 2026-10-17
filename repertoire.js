/** Arreglos propios: no contiene transcripciones de grabaciones comerciales. */
const progression = {
  C: [48, 52, 55],
  F: [41, 45, 48],
  G: [43, 47, 50],
  Am: [45, 48, 52],
  Dm: [50, 53, 57],
  Em: [40, 43, 47],
  Bb: [46, 50, 53],
  D: [50, 54, 57],
  A: [45, 49, 52],
  E: [40, 44, 47],
};
function arrange(
  id,
  title,
  level,
  style,
  goal,
  melody,
  chords,
  pattern = "bass",
  bpm = 60,
  credit = "Composición original de Clavia",
) {
  const notes = [];
  melody.forEach((bar, b) => {
    let beat = b * 4;
    bar.forEach((item) => {
      const [pitch, duration] = Array.isArray(item) ? item : [item, 1];
      if (pitch !== null)
        notes.push({
          id: `${id}-r-${notes.length}`,
          pitch,
          start: beat,
          duration,
          hand: "right",
        });
      beat += duration;
    });
    if (beat !== (b + 1) * 4) throw Error(`Compás incompleto: ${title}`);
    const chord = progression[chords[b % chords.length]];
    const add = (pitch, offset, duration) =>
      notes.push({
        id: `${id}-l-${notes.length}`,
        pitch,
        start: b * 4 + offset,
        duration,
        hand: "left",
      });
    if (pattern === "bass") add(chord[0], 0, 4);
    if (pattern === "fifths") {
      add(chord[0], 0, 2);
      add(chord[2], 2, 2);
    }
    if (pattern === "broken")
      [0, 2, 1, 2].forEach((i, t) => add(chord[i], t, 1));
    if (pattern === "ballad") {
      add(chord[0], 0, 2);
      chord.slice(1).forEach((p) => add(p, 2, 2));
    }
    if (pattern === "pulse")
      [0, 1, 2, 3].forEach((t) => chord.forEach((p) => add(p, t, 1)));
    if (pattern === "boogie")
      [0, 2, 0, 2, 0, 2, 0, 2].forEach((i, t) =>
        add(chord[i] + (t === 5 ? 2 : 0), t / 2, 0.5),
      );
  });
  const score = {
    id,
    title,
    description: goal,
    meter: 4,
    bars: melody.length,
    notes,
  };
  return {
    id,
    title,
    artist: "Clavia",
    level,
    style,
    detail: credit,
    goal,
    chords: chords.join(" · "),
    bpm,
    score,
  };
}
const light = [
  [60, 62, 64, 67],
  [64, 62, [60, 2]],
  [62, 64, 65, 69],
  [67, 65, [64, 2]],
  [64, 67, 69, 67],
  [65, 64, 62, 60],
  [62, 65, 64, 62],
  [[60, 4]],
];
const home = [
  [64, 67, 64, 60],
  [64, 69, 67, 64],
  [65, 69, 65, 60],
  [62, 67, 71, 67],
  [67, 64, 62, 64],
  [69, 67, 64, 60],
  [65, 62, 67, 71],
  [[72, 4]],
];
const night = [
  [[64, 2], 67, 71],
  [69, 67, [64, 2]],
  [[65, 2], 69, 72],
  [71, 69, [67, 2]],
  [[64, 2], 67, 72],
  [71, 69, 67, 64],
  [65, 64, 62, 59],
  [[60, 4]],
];
const eighths = [
  [64, 0.5],
  [67, 0.5],
  [69, 0.5],
  [67, 0.5],
  [64, 1],
  [62, 1],
];
export const pieces = [
  arrange(
    "primeras-luces",
    "Primeras luces",
    "Principiante",
    "Primeros pasos",
    "Sostené un bajo de cuatro pulsos mientras la derecha canta. Empezá con cada mano por separado.",
    light,
    ["C", "C", "F", "C", "Am", "F", "G", "C"],
  ),
  arrange(
    "vuelta-casa",
    "Una vuelta por casa",
    "Inicial",
    "Balada",
    "Bajo y quinta en la izquierda; fraseo de cuatro notas en la derecha.",
    home,
    ["C", "Am", "F", "G"],
    "fifths",
  ),
  arrange(
    "ventana",
    "La ventana encendida",
    "Inicial",
    "Rock argentino",
    "Estudio original de balada: bajo en el primer pulso y dos notas juntas en el tercero.",
    night,
    ["C", "Am", "F", "G"],
    "ballad",
    55,
  ),
  arrange(
    "domingo",
    "Domingo en la ciudad",
    "Intermedio",
    "Rock argentino",
    "Arpegio continuo en la izquierda. Conservá la melodía más presente que el acompañamiento.",
    home,
    ["C", "Am", "F", "G"],
    "broken",
    65,
  ),
  arrange(
    "satellites",
    "Pequeños satélites",
    "Intermedio",
    "Rock argentino",
    "Alterná corcheas y negras sin acelerar los bajos. Una composición propia para trabajar independencia.",
    [
      eighths,
      [65, 69, 72, 69],
      eighths,
      [62, 67, [71, 2]],
      eighths,
      [69, 67, 64, 60],
      [65, 64, 62, 59],
      [[60, 4]],
    ],
    ["C", "F", "Am", "G"],
    "broken",
    60,
  ),
  arrange(
    "medianoche",
    "Después de medianoche",
    "Intermedio",
    "Balada",
    "Ligá el motivo de la derecha y cambiá el bajo con precisión. Reducí el tempo antes de juntar ambas manos.",
    night,
    ["Am", "C", "F", "G"],
    "ballad",
    60,
  ),
  arrange(
    "puentes",
    "Puentes de luz",
    "Intermedio",
    "Pop piano",
    "Ocho compases con bajos partidos y acordes cercanos: escuchá primero la guía y practicá en bloques de dos.",
    home,
    ["C", "G", "Am", "F"],
    "ballad",
    65,
  ),
  arrange(
    "estacion",
    "La última estación",
    "Inicial",
    "Balada",
    "La derecha toca blancas y la izquierda negras. Probá invertir qué mano escuchás como protagonista.",
    [
      [
        [64, 2],
        [67, 2],
      ],
      [
        [69, 2],
        [64, 2],
      ],
      [
        [65, 2],
        [69, 2],
      ],
      [
        [67, 2],
        [62, 2],
      ],
      [
        [64, 2],
        [72, 2],
      ],
      [
        [69, 2],
        [67, 2],
      ],
      [
        [65, 2],
        [62, 2],
      ],
      [[60, 4]],
    ],
    ["C", "Am", "F", "G"],
    "broken",
    50,
  ),
  arrange(
    "liverpool",
    "Postal de Liverpool",
    "Intermedio",
    "Pop piano",
    "Composición original, no una canción de los Beatles. Bajos alternados y una melodía sencilla con corcheas.",
    [home[0], eighths, home[2], home[3], home[4], eighths, home[6], home[7]],
    ["C", "Am", "F", "G"],
    "fifths",
    70,
  ),
  arrange(
    "arena",
    "Luces del escenario",
    "Avanzado",
    "Rock piano",
    "Acordes de tres notas en cada pulso con la izquierda. Mantené la muñeca flexible y tocá suave.",
    home,
    ["C", "F", "Am", "G"],
    "pulse",
    70,
  ),
  arrange(
    "azul",
    "Paseo en azul",
    "Avanzado",
    "Blues",
    "Doce compases originales: corcheas en el bajo y una melodía con notas de blues. El ritmo se toca recto, sin swing.",
    [
      [60, 63, 65, 67],
      [70, 67, 65, 63],
      [60, 65, 66, 67],
      [
        [72, 2],
        [70, 2],
      ],
      [65, 68, 70, 72],
      [70, 68, 65, 63],
      [60, 63, 65, 67],
      [70, 67, [60, 2]],
      [67, 71, 74, 72],
      [65, 69, 72, 70],
      [67, 65, 63, 62],
      [[60, 4]],
    ],
    ["C", "C", "C", "C", "F", "F", "C", "C", "G", "F", "C", "G"],
    "boogie",
    60,
  ),
  arrange(
    "motor",
    "Motor de ocho",
    "Avanzado",
    "Rock piano",
    "La izquierda marca ocho corcheas por compás; la derecha conserva notas largas sin copiar ese ritmo.",
    night,
    ["C", "Am", "F", "G"],
    "boogie",
    65,
  ),
  arrange(
    "alegria",
    "Oda a la alegría",
    "Inicial",
    "Clásico",
    "Tema de Beethoven en un arreglo sencillo propio. Izquierda: una nota larga por compás.",
    [
      [64, 64, 65, 67],
      [67, 65, 64, 62],
      [60, 60, 62, 64],
      [
        [64, 1.5],
        [62, 0.5],
        [62, 2],
      ],
      [64, 64, 65, 67],
      [67, 65, 64, 62],
      [60, 60, 62, 64],
      [
        [62, 1.5],
        [60, 0.5],
        [60, 2],
      ],
    ],
    ["C", "G", "C", "G", "C", "G", "C", "C"],
    "bass",
    60,
    "Beethoven · Tema de dominio público · Arreglo propio",
  ),
  arrange(
    "fray",
    "Fray Santiago",
    "Principiante",
    "Tradicional",
    "Melodía tradicional con bajos largos. Leé los nombres y mantené el pulso durante las blancas.",
    [
      [60, 62, 64, 60],
      [60, 62, 64, 60],
      [
        [64, 1],
        [65, 1],
        [67, 2],
      ],
      [
        [64, 1],
        [65, 1],
        [67, 2],
      ],
      [[67, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], 64, 60],
      [[67, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], 64, 60],
      [60, 55, [60, 2]],
      [60, 55, [60, 2]],
    ],
    ["C", "C", "C", "C", "F", "C", "G", "C"],
    "bass",
    55,
    "Tradicional · Dominio público · Arreglo propio",
  ),
  arrange(
    "susanna",
    "Oh! Susanna",
    "Intermedio",
    "Tradicional",
    "Tema de Stephen Foster con acompañamiento propio. Anticipá los cambios de mano sin perder la melodía.",
    [
      [[60, 0.5], [62, 0.5], 64, 67, [67, 1]],
      [
        [69, 1],
        [67, 1],
        [64, 2],
      ],
      [[60, 0.5], [62, 0.5], 64, 64, 62],
      [
        [60, 1],
        [62, 1],
        [64, 2],
      ],
      [[60, 0.5], [62, 0.5], 64, 67, 67],
      [69, 67, [64, 2]],
      [60, 62, 64, 62],
      [[60, 4]],
    ],
    ["C", "C", "C", "G", "C", "F", "G", "C"],
    "broken",
    65,
    "Stephen Foster · Tema de dominio público · Arreglo propio",
  ),
];
const song = (id, title, artist, focus, level = "Intermedio") => ({
  id,
  title,
  artist,
  focus,
  level,
  style: "Canción",
  detail: "Requiere tu MIDI",
  licensed: true,
});
export const songCatalog = [
  song(
    "charly-ojos",
    "Ojos de videotape",
    "Charly García",
    "Acordes, voces internas y melodía",
  ),
  song(
    "charly-inconsciente",
    "Inconsciente colectivo",
    "Charly García",
    "Melodía sobre acompañamiento armónico",
  ),
  song(
    "charly-promesas",
    "Promesas sobre el bidet",
    "Charly García",
    "Independencia rítmica y acordes",
  ),
  song(
    "charly-dinosaurios",
    "Los dinosaurios",
    "Charly García",
    "Balance entre melodía y acompañamiento",
  ),
  song(
    "charly-cerca",
    "Cerca de la revolución",
    "Charly García",
    "Pulso y acordes de rock",
  ),
  song(
    "seru-desarma",
    "Desarma y sangra",
    "Serú Girán",
    "Arpegios y conducción de voces",
    "Avanzado",
  ),
  song(
    "seru-seminare",
    "Seminare",
    "Serú Girán",
    "Acompañamiento de balada y fraseo",
  ),
  song(
    "seru-eiti",
    "Eiti Leda",
    "Serú Girán",
    "Cambios de textura y dinámica",
    "Avanzado",
  ),
  song(
    "seru-cuanto",
    "Cuánto tiempo más llevará",
    "Serú Girán",
    "Continuidad del acompañamiento",
  ),
  song(
    "fito-once",
    "11 y 6",
    "Fito Páez",
    "Melodía cantabile y acompañamiento",
  ),
  song(
    "fito-vestido",
    "Un vestido y un amor",
    "Fito Páez",
    "Arpegios, inversiones y fraseo",
  ),
  song(
    "fito-amor",
    "El amor después del amor",
    "Fito Páez",
    "Pulso de rock y acordes",
  ),
  song(
    "fito-mariposa",
    "Mariposa tecknicolor",
    "Fito Páez",
    "Acompañamiento y energía rítmica",
  ),
  song(
    "beatles-let",
    "Let It Be",
    "The Beatles",
    "Acordes y melodía en la mano derecha",
    "Inicial",
  ),
  song(
    "beatles-jude",
    "Hey Jude",
    "The Beatles",
    "Balada, inversiones y crecimiento dinámico",
  ),
  song(
    "beatles-long",
    "The Long and Winding Road",
    "The Beatles",
    "Fraseo y cambios armónicos",
  ),
  song(
    "beatles-lady",
    "Lady Madonna",
    "The Beatles",
    "Bajo de boogie e independencia",
    "Avanzado",
  ),
  song(
    "queen-stop",
    "Don’t Stop Me Now",
    "Queen",
    "Acordes rápidos y articulación",
    "Avanzado",
  ),
  song(
    "elton-song",
    "Your Song",
    "Elton John",
    "Arpegios y balance entre las manos",
  ),
  song(
    "elton-dancer",
    "Tiny Dancer",
    "Elton John",
    "Patrones de acompañamiento",
  ),
  song(
    "billy-piano",
    "Piano Man",
    "Billy Joel",
    "Acompañamiento en tres por cuatro",
  ),
  song(
    "coldplay-scientist",
    "The Scientist",
    "Coldplay",
    "Acordes repetidos y pulso",
    "Inicial",
  ),
  song(
    "coldplay-clocks",
    "Clocks",
    "Coldplay",
    "Patrón repetido y regularidad",
  ),
  song(
    "queen-love",
    "Love of My Life",
    "Queen",
    "Arpegios y melodía",
    "Avanzado",
  ),
];
export const escapeHTML = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function searchRepertoire(
  items,
  {
    query = "",
    level = "all",
    artist = "all",
    favorites = false,
    favoriteIds = [],
  } = {},
) {
  const normalize = (s) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  return items.filter(
    (p) =>
      (level === "all" || p.level === level) &&
      (artist === "all" || p.artist === artist) &&
      (!favorites || favoriteIds.includes(p.id)) &&
      normalize(
        `${p.title} ${p.artist} ${p.style} ${p.goal || p.focus || ""}`,
      ).includes(normalize(query.trim())),
  );
}
