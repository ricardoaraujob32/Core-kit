// apps/web/src/features/tenant-admin/transacoes/hooks/useTransacoesPermissions.ts

import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useTransacoesPermissions() {
  const auth = useAuthorization();

  const canList = auth.canAccessTransacoesModule();

  return {
    canList,
    canAccess: canList,
    canCreate: auth.canCreateTransacao(),
    canEdit: auth.canEditTransacao(),
    canCancel: auth.canCancelTransacao(),
    canConclude: auth.canConcludeTransacao(),
  };
}
