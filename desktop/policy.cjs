exports.allowed = [
  "/index.html",
  "/style.css",
  "/studio.css",
  "/app.js",
  "/curriculum.js",
  "/progress.js",
  "/music.js",
  "/guided-score.js",
  "/guided-ui.js",
  "/repertoire.js",
  "/library-ui.js",
  "/midi-file.js",
  "/library-store.js",
  "/instrument.js",
  "/advanced-curriculum.js",
  "/learning.js",
  "/course-ui.js",
  "/improvisation.js",
  "/aural-lab.js",
  "/assets/fonts/manrope.woff2",
  "/assets/fonts/newsreader.woff2",
  "/import-dialog.js",
  "/musicxml-file.js",
  "/vendor/fflate.js",
  "/examples/primer-dialogo.musicxml",
];
exports.mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".musicxml": "application/vnd.recordare.musicxml+xml",
  ".woff2": "font/woff2",
};
exports.csp =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'";
exports.isLocal = (value) => {
  try {
    const u = new URL(value);
    return (
      u.protocol === "clavia:" &&
      u.hostname === "app" &&
      !u.port &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
};
exports.isSafeExternal = (value) => {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      [
        "viva.pressbooks.pub",
        "developer.mozilla.org",
        "audiveris.github.io",
        "handbook.musescore.org",
        "github.com",
        "www.abrsm.org",
        "www.rcmusic.com",
      ].includes(u.hostname) &&
      !u.username &&
      !u.password
    );
  } catch {
    return false;
  }
};
