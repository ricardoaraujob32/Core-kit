// apps/web/src/features/tenant-admin/fornecedores/hooks/useFornecedoresPermissions.ts

import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useFornecedoresPermissions() {
  const auth = useAuthorization();

  const canList = auth.canAccessFornecedoresModule();

  return {
    canList,
    canAccess: canList,
    canCreate: auth.canCreateFornecedor(),
    canEdit: auth.canEditFornecedor(),
    canDelete: auth.canDeleteFornecedor(),
  };
}
