// apps/web/src/shared/pwa/pwaLocalSchema.ts

export const PWA_LOCAL_SCHEMA_VERSION = 2;

export const PWA_LOCAL_SCHEMA_KEY = "corekit:pwa:schema-version";
export const PWA_LOCAL_SCHEMA_BACKUP_PREFIX = "corekit:pwa:backup:";

export type PwaLocalSchemaStatus = {
  currentVersion: number;
  targetVersion: number;
  needsMigration: boolean;
};

export function getPwaLocalSchemaVersion(): number {
  if (typeof localStorage === "undefined") return PWA_LOCAL_SCHEMA_VERSION;

  const raw = localStorage.getItem(PWA_LOCAL_SCHEMA_KEY);
  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function setPwaLocalSchemaVersion(version: number): void {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(PWA_LOCAL_SCHEMA_KEY, String(version));
}

export function getPwaLocalSchemaStatus(): PwaLocalSchemaStatus {
  const currentVersion = getPwaLocalSchemaVersion();

  return {
    currentVersion,
    targetVersion: PWA_LOCAL_SCHEMA_VERSION,
    needsMigration: currentVersion < PWA_LOCAL_SCHEMA_VERSION,
  };
}

export function getPwaLocalStorageSnapshot(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};

  const snapshot: Record<string, string> = {};

  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("corekit:pwa:")) {
      snapshot[key] = localStorage.getItem(key) ?? "";
    }
  }

  return snapshot;
}

export function backupPwaLocalStorage(reason: string): string | null {
  if (typeof localStorage === "undefined") return null;

  const backupKey = `${PWA_LOCAL_SCHEMA_BACKUP_PREFIX}${Date.now()}:${reason}`;

  localStorage.setItem(
    backupKey,
    JSON.stringify({
      reason,
      createdAt: new Date().toISOString(),
      snapshot: getPwaLocalStorageSnapshot(),
    }),
  );

  return backupKey;
}
