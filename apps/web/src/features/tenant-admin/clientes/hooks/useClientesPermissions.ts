// apps/web/src/features/tenant-admin/clientes/hooks/useClientesPermissions.ts

import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useClientesPermissions() {
  const auth = useAuthorization();

  const canList = auth.canAccessClientesModule();

  return {
    canList,
    canAccess: canList,
    canCreate: auth.canCreateCliente(),
    canEdit: auth.canEditCliente(),
    canDelete: auth.canDeleteCliente(),
  };
}
