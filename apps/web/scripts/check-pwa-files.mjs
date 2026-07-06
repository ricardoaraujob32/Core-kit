// apps/web/scripts/check-pwa-files.mjs

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "src/shared/pwa/index.ts",
  "src/shared/pwa/PwaLayout.tsx",
  "src/shared/pwa/PwaScopeProvider.tsx",
  "src/shared/pwa/PwaSyncCenterSummary.tsx",
  "src/shared/pwa/PwaIntegrityPanel.tsx",
  "src/shared/pwa/PwaRecoveryPanel.tsx",
  "src/shared/pwa/PwaConflictResolutionPanel.tsx",
  "src/shared/pwa/PwaQueueSanitizerPanel.tsx",
  "src/shared/pwa/PwaSyncLogPanel.tsx",
  "src/shared/pwa/PwaSupportSnapshotPanel.tsx",
  "src/shared/pwa/PwaSelectiveBackupPanel.tsx",
  "src/shared/pwa/PwaStorageRetentionPanel.tsx",
  "src/shared/pwa/PwaDiagnosticsPanel.tsx",
  "src/shared/pwa/useValidatedScopedOfflineEnqueue.ts",
  "src/shared/pwa/validatedScopedOfflineQueue.ts",
  "src/shared/pwa/pwaPayloadValidation.ts",
  "src/shared/pwa/pwaPayloadNormalizers.ts",
  "src/shared/pwa/createScopedOfflineProcessor.ts",
  "src/features/tenant-admin/sync/pages/SyncCenterPage.tsx",
];

let ok = true;

console.log("Verificando arquivos PWA obrigatórios...");

for (const file of requiredFiles) {
  const path = resolve(root, file);

  if (!existsSync(path)) {
    console.error(`❌ Ausente: ${file}`);
    ok = false;
  } else {
    console.log(`✅ ${file}`);
  }
}

if (!ok) {
  console.error("\nArquivos PWA obrigatórios ausentes.");
  process.exit(1);
}

console.log("\n✅ Arquivos PWA obrigatórios encontrados.");
