/** Frena la publicación si el paquete omite un recurso que la app necesita. */
const path = require("node:path");
const asar = require("@electron/asar");
const { allowed } = require("../desktop/policy.cjs");

module.exports = async function verifyPackage(context) {
  const resources =
    context.electronPlatformName === "darwin"
      ? path.join(
          context.appOutDir,
          `${context.packager.appInfo.productFilename}.app`,
          "Contents",
          "Resources",
        )
      : path.join(context.appOutDir, "resources");
  const archive = path.join(resources, "app.asar");
  const files = new Set(asar.listPackage(archive));
  const required = [
    ...allowed,
    "/LICENSE",
    "/THIRD_PARTY_NOTICES.md",
    "/PRIVACY.md",
  ];
  const missing = required.filter((file) => !files.has(file));
  if (missing.length)
    throw new Error(`El instalador está incompleto: ${missing.join(", ")}`);
  for (const file of required) {
    if (!asar.extractFile(archive, file.slice(1)).length)
      throw new Error(`El instalador contiene un recurso vacío: ${file}`);
  }
  console.log(
    `Paquete verificado: ${required.length} recursos y licencias incluidos.`,
  );
};
