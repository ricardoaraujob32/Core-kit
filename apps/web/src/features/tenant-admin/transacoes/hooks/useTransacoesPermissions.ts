import { useMemo } from "react";
import {
  canAccessTransacoesModule,
  canCancelTransacao,
  canConcludeTransacao,
  canCreateTransacao,
  canEditTransacao,
} from "../../../../core/api/permissions";
import { useAuthorization } from "../../../../core/auth/useAuthorization";

export function useTransacoesPermissions() {
  const { ctx } = useAuthorization();

  return useMemo(
    () => ({
      canList: canAccessTransacoesModule(ctx),
      canCreate: canCreateTransacao(ctx),
      canEdit: canEditTransacao(ctx),
      canCancel: canCancelTransacao(ctx),
      canConclude: canConcludeTransacao(ctx),
    }),
    [ctx],
  );
}
