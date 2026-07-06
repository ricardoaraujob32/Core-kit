// apps/web/src/shared/pwa/pwaRetentionPolicy.ts

import { getPwaStorageUsage } from "./pwaStorageUsage";

export type PwaRetentionResult = {
  cleanedAt: string;
  removedKeys: string[];
  keptKeys: string[];
  messages: string[];
};

export type PwaRetentionOptions = {
  maxBackups?: number;
  maxLogEntriesPerKey?: number;
  removeCacheOlderThanDays?: number;
};

const DEFAULT_OPTIONS: Required<PwaRetentionOptions> = {
  maxBackups: 5,
  maxLogEntriesPerKey: 200,
  removeCacheOlderThanDays: 14,
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getEnvelopeDate(raw: string | null): Date | null {
  const parsed = safeParse<{
    updatedAt?: string;
    createdAt?: string;
    exportedAt?: string;
  }>(raw);

  const value = parsed?.updatedAt ?? parsed?.createdAt ?? parsed?.exportedAt;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function olderThan(date: Date, days: number): boolean {
  const limit = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() < limit;
}

function cleanupBackups(maxBackups: number, result: PwaRetentionResult) {
  const backupKeys = Object.keys(localStorage)
    .filter((key) => key.startsWith("corekit:pwa:backup:"))
    .sort()
    .reverse();

  const toRemove = backupKeys.slice(maxBackups);

  for (const key of toRemove) {
    localStorage.removeItem(key);
    result.removedKeys.push(key);
  }

  for (const key of backupKeys.slice(0, maxBackups)) {
    result.keptKeys.push(key);
  }

  if (toRemove.length > 0) {
    result.messages.push(`${toRemove.length} backup(s) antigo(s) removido(s).`);
  }
}

function cleanupLogs(maxLogEntriesPerKey: number, result: PwaRetentionResult) {
  const logKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith("corekit:pwa:sync-log:"),
  );

  for (const key of logKeys) {
    const current = safeParse<unknown[]>(localStorage.getItem(key));

    if (!Array.isArray(current)) continue;

    if (current.length > maxLogEntriesPerKey) {
      localStorage.setItem(
        key,
        JSON.stringify(current.slice(0, maxLogEntriesPerKey)),
      );

      result.messages.push(
        `Log reduzido para ${maxLogEntriesPerKey} entrada(s): ${key}`,
      );
    }

    result.keptKeys.push(key);
  }
}

function cleanupOldCaches(days: number, result: PwaRetentionResult) {
  const cacheKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith("corekit:pwa:cache:"),
  );

  for (const key of cacheKeys) {
    const date = getEnvelopeDate(localStorage.getItem(key));

    if (date && olderThan(date, days)) {
      localStorage.removeItem(key);
      result.removedKeys.push(key);
    } else {
      result.keptKeys.push(key);
    }
  }
}

export function runPwaRetentionPolicy(
  options: PwaRetentionOptions = {},
): PwaRetentionResult {
  const resolved = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const result: PwaRetentionResult = {
    cleanedAt: new Date().toISOString(),
    removedKeys: [],
    keptKeys: [],
    messages: [],
  };

  if (typeof localStorage === "undefined") {
    result.messages.push("localStorage indisponível.");
    return result;
  }

  cleanupBackups(resolved.maxBackups, result);
  cleanupLogs(resolved.maxLogEntriesPerKey, result);
  cleanupOldCaches(resolved.removeCacheOlderThanDays, result);

  const usage = getPwaStorageUsage();

  result.messages.push(
    `Uso PWA após limpeza: ${usage.totalKb} KB em ${usage.entries.length} chave(s).`,
  );

  window.dispatchEvent(
    new CustomEvent("corekit:pwa-retention-ran", {
      detail: result,
    }),
  );

  return result;
}
