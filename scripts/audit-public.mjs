/** Control de publicación: reporta ubicación y categoría, nunca el valor encontrado. */
import { execFileSync } from "node:child_process";
import { readFileSync, lstatSync } from "node:fs";
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean),
  findings = [];
const rules = [
  ["ruta personal", /\/Users\/[^/\s]+\/|[A-Z]:[\\/]+Users[\\/]/],
  [
    "credencial GitHub",
    /gh[pousr]_[A-Za-z0-9]{32,}|github_pat_[A-Za-z0-9_]{50,}/,
  ],
  ["clave privada", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  [
    "credencial de proveedor",
    /(?:sk-proj-|sk-ant-)[A-Za-z0-9_-]{24,}|AKIA[0-9A-Z]{16}/,
  ],
];
for (const file of files) {
  if (
    /^(?:artifacts|dist|node_modules|test-results|playwright-report)\//.test(
      file,
    ) ||
    /(?:^|\/)\.env(?:\.|$)|\.(?:p12|pfx|pem|key)$/.test(file) ||
    /(?:backup|progreso|progress).*\.json$/i.test(file)
  )
    findings.push({ file, category: "archivo privado o generado" });
  if (lstatSync(file).isSymbolicLink()) {
    findings.push({ file, category: "enlace simbólico que requiere revisión" });
    continue;
  }
  const bytes = readFileSync(file);
  if (bytes.length > 10_000_000)
    findings.push({
      file,
      category: "archivo demasiado grande para fuente pública",
    });
  const text = bytes.toString("utf8");
  for (const [category, pattern] of rules)
    if (pattern.test(text)) findings.push({ file, category });
}
if (findings.length) {
  console.error(
    JSON.stringify({ status: "review_required", findings }, null, 2),
  );
  process.exitCode = 1;
} else
  console.log(
    JSON.stringify({
      status: "passed",
      files: files.length,
      scope:
        "tracked files; complementary to secret scanning and manual review",
    }),
  );
