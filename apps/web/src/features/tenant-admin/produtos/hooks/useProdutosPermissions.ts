// apps/web/src/features/tenant-admin/produtos/hooks/useProdutosPermissions.ts

import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useProdutosPermissions() {
  const auth = useAuthorization();

  const canList = auth.canAccessProdutosModule();

  return {
    canList,
    canAccess: canList,
    canCreate: auth.canCreateProduto(),
    canEdit: auth.canEditProduto(),
    canDelete: auth.canDeleteProduto(),
  };
}
