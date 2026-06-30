import { useMemo } from "react";
import {
  canAccessOrdensServicoModule,
  canCancelOrdemServico,
  canConcludeOrdemServico,
  canCreateOrdemServico,
  canEditOrdemServico,
  canGenerateVendaFromOrdemServico,
} from "../../../../core/api/permissions";
import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useOrdensServicoPermissions() {
  const { ctx } = useAuthorization();

  return useMemo(
    () => ({
      canList: canAccessOrdensServicoModule(ctx),
      canCreate: canCreateOrdemServico(ctx),
      canEdit: canEditOrdemServico(ctx),
      canCancel: canCancelOrdemServico(ctx),
      canConclude: canConcludeOrdemServico(ctx),
      canGenerateVenda: canGenerateVendaFromOrdemServico(ctx),
    }),
    [ctx],
  );
}
