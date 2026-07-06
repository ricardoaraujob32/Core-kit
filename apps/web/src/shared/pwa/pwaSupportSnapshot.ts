// apps/web/src/shared/pwa/pwaSupportSnapshot.ts

import { collectPwaDiagnostics } from "./pwaDiagnostics";
import { createScopedOfflineIdMap } from "./scopedOfflineIdMap";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { createPwaSyncLogStore } from "./pwaSyncLogStore";
import { serializePwaScope, type PwaScope } from "./pwaScope";

export type PwaSupportSnapshot = {
  version: 1;
  exportedAt: string;
  scopeKey: string;
  diagnostics: Awaited<ReturnType<typeof collectPwaDiagnostics>>;
  queue: unknown[];
  idMap: unknown[];
  syncLogs: unknown[];
  pwaLocalStorage: Record<string, string>;
};

function getPwaLocalStorage(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};

  const output: Record<string, string> = {};

  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("corekit:pwa:")) {
      output[key] = localStorage.getItem(key) ?? "";
    }
  }

  return output;
}

export async function createPwaSupportSnapshot(
  scope: PwaScope,
): Promise<PwaSupportSnapshot> {
  const queue = createScopedOfflineQueue(scope);
  const idMap = createScopedOfflineIdMap(scope);
  const syncLog = createPwaSyncLogStore(scope);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    scopeKey: serializePwaScope(scope),
    diagnostics: await collectPwaDiagnostics(scope),
    queue: queue.list(),
    idMap: idMap.list(),
    syncLogs: syncLog.list(),
    pwaLocalStorage: getPwaLocalStorage(),
  };
}

export function stringifyPwaSupportSnapshot(snapshot: PwaSupportSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function parsePwaSupportSnapshot(raw: string): PwaSupportSnapshot {
  const parsed = JSON.parse(raw) as PwaSupportSnapshot;

  if (!parsed || parsed.version !== 1 || !parsed.scopeKey) {
    throw new Error("Snapshot PWA inválido.");
  }

  return parsed;
}

export function downloadPwaSupportSnapshot(snapshot: PwaSupportSnapshot) {
  const blob = new Blob([stringifyPwaSupportSnapshot(snapshot)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `corekit-pwa-snapshot-${Date.now()}.json`;
  anchor.click();

  URL.revokeObjectURL(url);
}

/**
 * Importação voltada a diagnóstico/teste.
 * Por segurança, não deve ser usada automaticamente em produção sem confirmação.
 */
export function importPwaSupportSnapshot(snapshot: PwaSupportSnapshot) {
  if (typeof localStorage === "undefined") return;

  for (const [key, value] of Object.entries(snapshot.pwaLocalStorage)) {
    if (key.startsWith("corekit:pwa:")) {
      localStorage.setItem(key, value);
    }
  }

  window.dispatchEvent(
    new CustomEvent("corekit:pwa-support-snapshot-imported", {
      detail: {
        importedAt: new Date().toISOString(),
        scopeKey: snapshot.scopeKey,
      },
    }),
  );
}
