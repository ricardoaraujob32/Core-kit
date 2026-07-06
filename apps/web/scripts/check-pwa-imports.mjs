// apps/web/scripts/check-pwa-imports.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = process.cwd();
const src = resolve(root, "src");

const warnings = [];
const errors = [];

function walk(dir) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      walk(full);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry)) continue;

    const rel = relative(root, full);
    const text = readFileSync(full, "utf8");

    if (text.includes("useScopedOfflineEnqueue")) {
      warnings.push(
        `${rel}: ainda usa useScopedOfflineEnqueue; considere useValidatedScopedOfflineEnqueue.`,
      );
    }

    if (text.includes("useOfflineMutationQueue(")) {
      warnings.push(
        `${rel}: usa fila global; em telas tenant prefira fila escopada.`,
      );
    }

    if (text.includes("OfflineQueuePanel") && !text.includes("ScopedOfflineQueuePanel")) {
      warnings.push(
        `${rel}: usa OfflineQueuePanel global; confirme se não deveria ser ScopedOfflineQueuePanel.`,
      );
    }

    if (text.includes("from "../../../../shared/pwa/PwaSyncCenterSummary"")) {
      warnings.push(
        `${rel}: pode importar de shared/pwa barrel se preferir.`,
      );
    }
  }
}

walk(src);

console.log("Verificando imports PWA...");

for (const warning of warnings) {
  console.warn(`⚠️ ${warning}`);
}

for (const error of errors) {
  console.error(`❌ ${error}`);
}

if (errors.length > 0) {
  process.exit(1);
}

if (warnings.length === 0) {
  console.log("✅ Nenhum alerta de import PWA encontrado.");
} else {
  console.log(`\n⚠️ ${warnings.length} alerta(s) encontrado(s).`);
}
