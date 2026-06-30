import { useMemo } from "react";
import {
  canAccessFornecedoresModule,
  canCreateFornecedor,
  canEditFornecedor,
} from "../../../../core/api/permissions";
import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useFornecedoresPermissions() {
  const { ctx } = useAuthorization();

  return useMemo(
    () => ({
      canList: canAccessFornecedoresModule(ctx),
      canCreate: canCreateFornecedor(ctx),
      canEdit: canEditFornecedor(ctx),
    }),
    [ctx],
  );
}
