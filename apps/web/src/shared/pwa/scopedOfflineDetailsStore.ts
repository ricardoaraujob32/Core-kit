// apps/web/src/shared/pwa/scopedOfflineDetailsStore.ts

import { buildPwaCacheKey, type PwaScope } from "./pwaScope";

const DETAILS_PREFIX = "corekit:pwa:details:";

export type OfflineDetailKind =
  | "transacao"
  | "ordemServico"
  | "cliente"
  | "fornecedor"
  | "produto"
  | "servico";

function storageKey(scope: PwaScope, kind: OfflineDetailKind, id: string) {
  return `${DETAILS_PREFIX}${buildPwaCacheKey(scope, `${kind}:${id}`)}`;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function createScopedOfflineDetailsStore(scope: PwaScope) {
  return {
    get<TDetail>(kind: OfflineDetailKind, id: string): TDetail | null {
      if (typeof localStorage === "undefined") return null;

      return safeParse<TDetail>(localStorage.getItem(storageKey(scope, kind, id)));
    },

    set<TDetail>(kind: OfflineDetailKind, id: string, detail: TDetail): void {
      if (typeof localStorage === "undefined") return;

      localStorage.setItem(
        storageKey(scope, kind, id),
        JSON.stringify({
          detail,
          updatedAt: new Date().toISOString(),
        }),
      );
    },

    getEnvelope<TDetail>(
      kind: OfflineDetailKind,
      id: string,
    ): { detail: TDetail; updatedAt: string } | null {
      if (typeof localStorage === "undefined") return null;

      return safeParse<{ detail: TDetail; updatedAt: string }>(
        localStorage.getItem(storageKey(scope, kind, id)),
      );
    },

    remove(kind: OfflineDetailKind, id: string): void {
      if (typeof localStorage === "undefined") return;

      localStorage.removeItem(storageKey(scope, kind, id));
    },

    clearKind(kind: OfflineDetailKind): void {
      if (typeof localStorage === "undefined") return;

      const prefix = `${DETAILS_PREFIX}${buildPwaCacheKey(scope, `${kind}:`)}`;

      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    },
  };
}
