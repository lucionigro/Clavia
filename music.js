/** Nombres respetando el grado diatónico: Do menor usa Mi♭, no Re♯. */
export function spellNotes(root, semitones, degrees) {
  const letters = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
  const natural = [0, 2, 4, 5, 7, 9, 11];
  // Tonalidades ofrecidas: C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B.
  const rootLetters = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6];
  const first = Math.floor(root / 12) * 7 + rootLetters[root % 12];
  return semitones.map((distance, i) => {
    const letter = first + degrees[i];
    const oct = Math.floor(letter / 7);
    const pitch = oct * 12 + natural[letter % 7];
    const alteration = root + distance - pitch;
    const sign =
      alteration > 0 ? "♯".repeat(alteration) : "♭".repeat(-alteration);
    return `${letters[letter % 7]}${sign}${oct - 1}`;
  });
}

/** Puntúa ataques contra una grilla absoluta; no premia un pulso regular desplazado. */
export function scoreRhythm(taps, start, period) {
  if (
    taps.length !== 8 ||
    !Number.isFinite(period) ||
    period <= 0 ||
    !Number.isFinite(start) ||
    taps.some((t) => !Number.isFinite(t))
  )
    return { score: 0, error: Infinity, passed: false };
  const error =
    taps.reduce((sum, t, i) => sum + Math.abs(t - (start + i * period)), 0) /
    taps.length;
  const score = Math.max(0, Math.round(100 - (error / period) * 100));
  return { error, score, passed: score >= 70 };
}
