// apps/web/src/features/tenant-admin/ordens-servico/hooks/useOrdensServicoPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { usePwaScope } from "../../../../shared/pwa/PwaScopeProvider";
import { useOrdensServico } from "./useOrdensServico";
import type { OrdemServico } from "../tipos";

function isOrdemServico(value: OrdemServico | null): value is OrdemServico {
  return value !== null;
}

type PendingWithOs = {
  ordensServico?: Array<Partial<OrdemServico> | null>;
  ordens?: Array<Partial<OrdemServico> | null>;
};

export function useOrdensServicoPwaList() {
  const resource = useOrdensServico();
  const pending = usePwaPendingProjections() as PendingWithOs;
  const { scope } = usePwaScope();

  const getId = useCallback((item: OrdemServico) => item.ordemServicoId, []);

  const pendingRaw = pending.ordensServico ?? pending.ordens ?? [];

  const pendingItems = useMemo(
    () =>
      pendingRaw
        .map((ordem) =>
          ordem
            ? ({
                ...ordem,
                locatarioId: scope.locatarioId,
              } as OrdemServico)
            : null,
        )
        .filter(isOrdemServico),
    [pendingRaw, scope.locatarioId],
  );

  const itens = useMergePwaPendingItems<OrdemServico>({
    items: resource.itens ?? [],
    pendingItems,
    getId,
  });

  return useMemo(
    () => ({
      ...resource,
      itens,
      data: itens,
    }),
    [resource, itens],
  );
}
