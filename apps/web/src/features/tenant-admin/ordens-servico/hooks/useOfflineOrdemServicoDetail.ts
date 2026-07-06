// apps/web/src/features/tenant-admin/ordens-servico/hooks/useOfflineOrdemServicoDetail.ts

import { useCallback } from "react";
import { useOfflineEntityDetail } from "../../../../shared/pwa/useOfflineEntityDetail";
import type { OrdemServico } from "../tipos";

export function useOfflineOrdemServicoDetail(
  ordemServicoId?: string | null,
  fallback?: OrdemServico | null,
) {
  const detail = useOfflineEntityDetail<OrdemServico>({
    kind: "ordemServico",
    id: ordemServicoId,
    fallback,
  });

  const salvarOrdemServico = useCallback(
    (ordemServico: OrdemServico) => {
      detail.save({
        ...ordemServico,
        atualizadoEm: new Date().toISOString(),
      });
    },
    [detail],
  );

  return {
    ...detail,
    ordemServico: detail.detail,
    salvarOrdemServico,
  };
}
