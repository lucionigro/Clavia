import http from "node:http";
import policy from "./desktop/policy.cjs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {
  ...policy.mime,
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};
const allowed = new Set(["/", ...policy.allowed]);
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (!allowed.has(url.pathname)) {
        res.writeHead(404);
        res.end("No encontrado");
        return;
      }
      const filename =
        url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      const body = await readFile(path.join(root, filename));
      res.writeHead(200, {
        "Content-Type": mime[path.extname(filename)] || "text/plain",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      });
      res.end(body);
    } catch {
      res.writeHead(500);
      res.end("No se pudo abrir la app");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Clavia disponible en http://localhost:${port}`),
  );
