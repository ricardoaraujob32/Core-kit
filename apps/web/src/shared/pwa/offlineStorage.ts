// apps/web/src/shared/pwa/offlineStorage.ts

import type { PwaCacheRecord } from "./pwaSyncTypes";

const CACHE_PREFIX = "corekit:pwa:cache:";
const QUEUE_KEY = "corekit:pwa:queue";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function cacheStorageKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

export const offlineStorage = {
  getCache<TData>(key: string): PwaCacheRecord<TData> | null {
    if (typeof localStorage === "undefined") return null;

    return safeParse<PwaCacheRecord<TData> | null>(
      localStorage.getItem(cacheStorageKey(key)),
      null,
    );
  },

  setCache<TData>(key: string, data: TData): PwaCacheRecord<TData> {
    const record: PwaCacheRecord<TData> = {
      key,
      data,
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(cacheStorageKey(key), JSON.stringify(record));
    }

    return record;
  },

  removeCache(key: string): void {
    if (typeof localStorage === "undefined") return;

    localStorage.removeItem(cacheStorageKey(key));
  },

  clearCache(): void {
    if (typeof localStorage === "undefined") return;

    const keys = Array.from({ length: localStorage.length })
      .map((_, index) => localStorage.key(index))
      .filter((key): key is string => Boolean(key))
      .filter((key) => key.startsWith(CACHE_PREFIX));

    for (const key of keys) {
      localStorage.removeItem(key);
    }
  },

  getQueueRaw(): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(QUEUE_KEY);
  },

  setQueueRaw(raw: string): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(QUEUE_KEY, raw);
  },

  removeQueue(): void {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(QUEUE_KEY);
  },
};
