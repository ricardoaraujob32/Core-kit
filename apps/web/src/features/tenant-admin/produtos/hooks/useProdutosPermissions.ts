import { useMemo } from "react";
import {
  canAccessProdutosModule,
  canCreateProduto,
  canEditProduto,
} from "../../../../core/api/permissions";
import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useProdutosPermissions() {
  const { ctx } = useAuthorization();

  return useMemo(
    () => ({
      canList: canAccessProdutosModule(ctx),
      canCreate: canCreateProduto(ctx),
      canEdit: canEditProduto(ctx),
    }),
    [ctx],
  );
}
