import { useMemo } from "react";
import {
  canAccessClientesModule,
  canCreateCliente,
  canEditCliente,
} from "../../../../core/api/permissions";
import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useClientesPermissions() {
  const { ctx } = useAuthorization();

  return useMemo(
    () => ({
      canList: canAccessClientesModule(ctx),
      canCreate: canCreateCliente(ctx),
      canEdit: canEditCliente(ctx),
    }),
    [ctx],
  );
}
