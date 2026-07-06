// apps/web/src/features/tenant-admin/ordens-servico/hooks/useOrdensServicoPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { useOrdensServico } from "./useOrdensServico";
import type { OrdemServico } from "../tipos";

export function useOrdensServicoPwaList() {
  const resource = useOrdensServico();
  const pending = usePwaPendingProjections();

  const getId = useCallback((item: OrdemServico) => item.ordemServicoId, []);

  const data = useMergePwaPendingItems<OrdemServico>({
    items: resource.ordens ?? [],
    pendingItems: pending.ordensServico as OrdemServico[],
    getId,
  });

  return useMemo(
    () => ({
      ...resource,
      ordens: data,
      data,
    }),
    [resource, data],
  );
}
