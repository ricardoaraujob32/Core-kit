// apps/web/src/features/tenant-admin/ordens-servico/hooks/useOrdensServicoPermissions.ts

import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useOrdensServicoPermissions() {
  const auth = useAuthorization();

  const canList = auth.canAccessOrdensServicoModule();

  return {
    canList,
    canAccess: canList,
    canCreate: auth.canCreateOrdemServico(),
    canEdit: auth.canEditOrdemServico(),
    canCancel: auth.canCancelOrdemServico(),
    canConclude: auth.canConcludeOrdemServico(),
    canGenerateVenda: auth.canGenerateVendaFromOrdemServico(),
  };
}
