// apps/web/scripts/check-pwa-all.mjs

import { spawnSync } from "node:child_process";

const scripts = [
  "scripts/check-pwa-files.mjs",
  "scripts/check-pwa-public.mjs",
  "scripts/check-pwa-imports.mjs",
];

let ok = true;

for (const script of scripts) {
  console.log(`\n▶ node ${script}`);

  const result = spawnSync(process.execPath, [script], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    ok = false;
  }
}

if (!ok) {
  console.error("\n❌ Validação PWA encontrou problemas.");
  process.exit(1);
}

console.log("\n✅ Validação PWA concluída.");
