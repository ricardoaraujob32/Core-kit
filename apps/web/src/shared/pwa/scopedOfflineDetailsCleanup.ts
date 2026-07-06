// apps/web/src/shared/pwa/scopedOfflineDetailsCleanup.ts

import { createScopedOfflineDetailsStore, type OfflineDetailKind } from "./scopedOfflineDetailsStore";
import { createScopedOfflineIdMap } from "./scopedOfflineIdMap";
import type { OfflineEntityKind } from "./offlineIdMap";
import type { PwaScope } from "./pwaScope";

const KIND_MAP: Record<OfflineEntityKind, OfflineDetailKind | null> = {
  cliente: "cliente",
  fornecedor: "fornecedor",
  produto: "produto",
  servico: "servico",
  transacao: "transacao",
  ordemServico: "ordemServico",
};

export function cleanupOfflineDetailAfterReconciliation(params: {
  scope: PwaScope;
  kind: OfflineEntityKind;
  localId: string;
}) {
  const detailKind = KIND_MAP[params.kind];

  if (!detailKind) return;

  const store = createScopedOfflineDetailsStore(params.scope);
  store.remove(detailKind, params.localId);
}

export function resolveScopedOfflineId(params: {
  scope: PwaScope;
  kind: OfflineEntityKind;
  id?: string | null;
}): string | null {
  if (!params.id) return null;

  const idMap = createScopedOfflineIdMap(params.scope);

  return idMap.resolve(params.kind, params.id);
}
