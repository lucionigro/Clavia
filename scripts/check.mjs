import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
for (const folder of [".", "desktop", "scripts"])
  for (const f of readdirSync(folder)) {
    if (!/\.(js|mjs|cjs)$/.test(f)) continue;
    const r = spawnSync(process.execPath, ["--check", `${folder}/${f}`], {
      stdio: "inherit",
    });
    if (r.status) process.exit(r.status);
  }
