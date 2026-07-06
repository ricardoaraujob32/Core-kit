// apps/web/src/shared/pwa/scopedOfflineIdMap.ts

import { buildPwaCacheKey, type PwaScope } from "./pwaScope";
import type { OfflineEntityKind, OfflineIdMapEntry } from "./offlineIdMap";

const ID_MAP_PREFIX = "corekit:pwa:id-map:";

function storageKey(scope: PwaScope): string {
  return `${ID_MAP_PREFIX}${buildPwaCacheKey(scope, "id-map")}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function createScopedOfflineIdMap(scope: PwaScope) {
  function readMap(): OfflineIdMapEntry[] {
    if (typeof localStorage === "undefined") return [];

    return safeParse<OfflineIdMapEntry[]>(
      localStorage.getItem(storageKey(scope)),
      [],
    );
  }

  function writeMap(entries: OfflineIdMapEntry[]) {
    if (typeof localStorage === "undefined") return;

    localStorage.setItem(storageKey(scope), JSON.stringify(entries));
  }

  return {
    key: storageKey(scope),

    list(): OfflineIdMapEntry[] {
      return readMap();
    },

    register(params: {
      kind: OfflineEntityKind;
      localId: string;
      remoteId: string;
    }) {
      const current = readMap();

      const next: OfflineIdMapEntry[] = [
        {
          kind: params.kind,
          localId: params.localId,
          remoteId: params.remoteId,
          syncedAt: new Date().toISOString(),
        },
        ...current.filter(
          (entry) =>
            !(entry.kind === params.kind && entry.localId === params.localId),
        ),
      ];

      writeMap(next);
    },

    resolve(
      kind: OfflineEntityKind,
      id: string | null | undefined,
    ): string | null {
      if (!id) return null;

      const found = readMap().find(
        (entry) => entry.kind === kind && entry.localId === id,
      );

      return found?.remoteId ?? id;
    },

    remove(kind: OfflineEntityKind, localId: string) {
      writeMap(
        readMap().filter(
          (entry) => !(entry.kind === kind && entry.localId === localId),
        ),
      );
    },

    clear() {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem(storageKey(scope));
    },
  };
}
