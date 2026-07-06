// apps/web/src/shared/pwa/__tests__/testPwaFactories.ts

import type { PwaScope } from "../pwaScope";
import type { PwaQueueItem } from "../pwaSyncTypes";

export const scopeA: PwaScope = {
  perfil: "tenant",
  locatarioId: "loc-a",
  usuarioId: "user-a",
};

export const scopeB: PwaScope = {
  perfil: "tenant",
  locatarioId: "loc-b",
  usuarioId: "user-b",
};

export function queueItem(params: Partial<PwaQueueItem>): PwaQueueItem {
  return {
    id: "queue-1",
    type: "clientes.criar",
    payload: {},
    localId: "cliente_offline_1",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    attempts: 0,
    lastError: null,
    lastErrorKind: null,
    lastErrorDetails: null,
    ...params,
  };
}
