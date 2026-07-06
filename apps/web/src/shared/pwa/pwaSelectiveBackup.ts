// apps/web/src/shared/pwa/pwaSelectiveBackup.ts

import { buildPwaCacheKey, type PwaScope } from "./pwaScope";
import { createScopedOfflineIdMap } from "./scopedOfflineIdMap";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { createPwaSyncLogStore } from "./pwaSyncLogStore";

export type PwaSelectiveBackupKind =
  | "queue"
  | "idMap"
  | "syncLogs"
  | "offlineDetails";

export type PwaSelectiveBackup = {
  version: 1;
  kind: PwaSelectiveBackupKind;
  exportedAt: string;
  scopeKey: string;
  data: unknown;
};

function getOfflineDetailsKeys(scope: PwaScope): string[] {
  if (typeof localStorage === "undefined") return [];

  const prefix = `corekit:pwa:details:${buildPwaCacheKey(scope, "")}`;

  return Object.keys(localStorage).filter((key) => key.startsWith(prefix));
}

function exportOfflineDetails(scope: PwaScope): Record<string, string> {
  const output: Record<string, string> = {};

  for (const key of getOfflineDetailsKeys(scope)) {
    output[key] = localStorage.getItem(key) ?? "";
  }

  return output;
}

function clearOfflineDetails(scope: PwaScope) {
  for (const key of getOfflineDetailsKeys(scope)) {
    localStorage.removeItem(key);
  }
}

function getScopeKey(scope: PwaScope): string {
  return buildPwaCacheKey(scope, "").replace(/:$/, "");
}

export function createPwaSelectiveBackup(params: {
  scope: PwaScope;
  kind: PwaSelectiveBackupKind;
}): PwaSelectiveBackup {
  const { scope, kind } = params;

  const queue = createScopedOfflineQueue(scope);
  const idMap = createScopedOfflineIdMap(scope);
  const logs = createPwaSyncLogStore(scope);

  let data: unknown;

  if (kind === "queue") data = queue.list();
  if (kind === "idMap") data = idMap.list();
  if (kind === "syncLogs") data = logs.list();
  if (kind === "offlineDetails") data = exportOfflineDetails(scope);

  return {
    version: 1,
    kind,
    exportedAt: new Date().toISOString(),
    scopeKey: getScopeKey(scope),
    data,
  };
}

export function stringifyPwaSelectiveBackup(
  backup: PwaSelectiveBackup,
): string {
  return JSON.stringify(backup, null, 2);
}

export function parsePwaSelectiveBackup(raw: string): PwaSelectiveBackup {
  const parsed = JSON.parse(raw) as PwaSelectiveBackup;

  if (!parsed || parsed.version !== 1 || !parsed.kind) {
    throw new Error("Backup seletivo PWA inválido.");
  }

  return parsed;
}

export function restorePwaSelectiveBackup(params: {
  scope: PwaScope;
  backup: PwaSelectiveBackup;
  mode: "replace" | "merge";
}) {
  const { scope, backup, mode } = params;

  const queue = createScopedOfflineQueue(scope);
  const idMap = createScopedOfflineIdMap(scope);
  const logs = createPwaSyncLogStore(scope);

  if (backup.kind === "queue") {
    const current = mode === "merge" ? queue.list() : [];
    const incoming = Array.isArray(backup.data) ? backup.data : [];

    queue.save([...incoming, ...current] as never[]);
    return;
  }

  if (backup.kind === "idMap") {
    const current = mode === "merge" ? idMap.list() : [];
    const incoming = Array.isArray(backup.data) ? backup.data : [];

    localStorage.setItem(idMap.key, JSON.stringify([...incoming, ...current]));
    return;
  }

  if (backup.kind === "syncLogs") {
    const current = mode === "merge" ? logs.list() : [];
    const incoming = Array.isArray(backup.data) ? backup.data : [];

    localStorage.setItem(logs.key, JSON.stringify([...incoming, ...current]));
    return;
  }

  if (backup.kind === "offlineDetails") {
    if (mode === "replace") {
      clearOfflineDetails(scope);
    }

    const details =
      typeof backup.data === "object" && backup.data !== null
        ? (backup.data as Record<string, string>)
        : {};

    for (const [key, value] of Object.entries(details)) {
      if (key.startsWith("corekit:pwa:details:")) {
        localStorage.setItem(key, value);
      }
    }
  }
}

export function clearPwaSelectiveData(params: {
  scope: PwaScope;
  kind: PwaSelectiveBackupKind;
}) {
  const { scope, kind } = params;

  if (kind === "queue") {
    createScopedOfflineQueue(scope).clear();
    return;
  }

  if (kind === "idMap") {
    createScopedOfflineIdMap(scope).clear();
    return;
  }

  if (kind === "syncLogs") {
    createPwaSyncLogStore(scope).clear();
    return;
  }

  if (kind === "offlineDetails") {
    clearOfflineDetails(scope);
  }
}
