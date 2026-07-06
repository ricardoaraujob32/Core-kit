// apps/web/src/shared/pwa/offlineIdMap.ts

const ID_MAP_KEY = "corekit:pwa:id-map";

export type OfflineEntityKind =
  | "cliente"
  | "fornecedor"
  | "produto"
  | "servico"
  | "transacao"
  | "ordemServico";

export type OfflineIdMapEntry = {
  kind: OfflineEntityKind;
  localId: string;
  remoteId: string;
  syncedAt: string;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readMap(): OfflineIdMapEntry[] {
  if (typeof localStorage === "undefined") return [];

  return safeParse<OfflineIdMapEntry[]>(
    localStorage.getItem(ID_MAP_KEY),
    [],
  );
}

function writeMap(entries: OfflineIdMapEntry[]) {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(ID_MAP_KEY, JSON.stringify(entries));
}

export const offlineIdMap = {
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
          !(
            entry.kind === params.kind &&
            entry.localId === params.localId
          ),
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
    localStorage.removeItem(ID_MAP_KEY);
  },
};

export function resolveOfflineId(
  kind: OfflineEntityKind,
  id: string | null | undefined,
): string | null {
  return offlineIdMap.resolve(kind, id);
}
