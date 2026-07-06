// apps/web/src/shared/pwa/useCleanupOfflineDetailAfterSync.ts

import { useCallback } from "react";
import type { OfflineEntityKind } from "./offlineIdMap";
import { cleanupOfflineDetailAfterReconciliation } from "./scopedOfflineDetailsCleanup";
import { usePwaScope } from "./PwaScopeProvider";
import { usePwaSyncEvents } from "./usePwaSyncEvents";

type UseCleanupOfflineDetailAfterSyncParams = {
  kind: OfflineEntityKind;
  localId?: string | null;
};

function operationMatchesKind(type: string, kind: OfflineEntityKind): boolean {
  if (kind === "cliente") return type === "clientes.criar";
  if (kind === "fornecedor") return type === "fornecedores.criar";
  if (kind === "servico") return type === "servicos.criar";
  if (kind === "transacao") return type === "vendas.criar" || type === "compras.criar";
  if (kind === "ordemServico") return type === "ordensServico.criar";

  return false;
}

export function useCleanupOfflineDetailAfterSync({
  kind,
  localId,
}: UseCleanupOfflineDetailAfterSyncParams) {
  const { scope } = usePwaScope();

  const handleItemSynced = useCallback(
    (detail: { item: { type: string; localId?: string | null } }) => {
      if (!localId) return;
      if (detail.item.localId !== localId) return;
      if (!operationMatchesKind(detail.item.type, kind)) return;

      cleanupOfflineDetailAfterReconciliation({
        scope,
        kind,
        localId,
      });
    },
    [kind, localId, scope],
  );

  usePwaSyncEvents({
    onItemSynced: handleItemSynced,
  });
}
