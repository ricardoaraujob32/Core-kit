// apps/web/src/shared/pwa/pwaStorageUsage.ts

export type PwaStorageUsageEntry = {
  key: string;
  bytes: number;
  category:
    | "queue"
    | "cache"
    | "idMap"
    | "details"
    | "logs"
    | "backup"
    | "schema"
    | "other";
};

export type PwaStorageUsageReport = {
  generatedAt: string;
  totalBytes: number;
  totalKb: number;
  entries: PwaStorageUsageEntry[];
  byCategory: Record<PwaStorageUsageEntry["category"], number>;
};

function byteSize(value: string): number {
  return new Blob([value]).size;
}

function classifyKey(key: string): PwaStorageUsageEntry["category"] {
  if (key.startsWith("corekit:pwa:queue:")) return "queue";
  if (key.startsWith("corekit:pwa:cache:")) return "cache";
  if (key.startsWith("corekit:pwa:id-map:")) return "idMap";
  if (key.startsWith("corekit:pwa:details:")) return "details";
  if (key.startsWith("corekit:pwa:sync-log:")) return "logs";
  if (key.startsWith("corekit:pwa:backup:")) return "backup";
  if (key === "corekit:pwa:schema-version") return "schema";

  return "other";
}

export function getPwaStorageUsage(): PwaStorageUsageReport {
  const entries: PwaStorageUsageEntry[] = [];

  if (typeof localStorage !== "undefined") {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("corekit:pwa:")) continue;

      const value = localStorage.getItem(key) ?? "";

      entries.push({
        key,
        bytes: byteSize(key) + byteSize(value),
        category: classifyKey(key),
      });
    }
  }

  const byCategory: PwaStorageUsageReport["byCategory"] = {
    queue: 0,
    cache: 0,
    idMap: 0,
    details: 0,
    logs: 0,
    backup: 0,
    schema: 0,
    other: 0,
  };

  for (const entry of entries) {
    byCategory[entry.category] += entry.bytes;
  }

  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);

  return {
    generatedAt: new Date().toISOString(),
    totalBytes,
    totalKb: Math.round((totalBytes / 1024) * 100) / 100,
    entries: entries.sort((a, b) => b.bytes - a.bytes),
    byCategory,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
