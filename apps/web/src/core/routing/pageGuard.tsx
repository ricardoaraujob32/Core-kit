// apps/web/src/core/routing/pageGuard.tsx

import type { PropsWithChildren, ReactNode } from "react";
import { useAuthorization } from "../auth/useAuthorization";

type PageGuardProps = PropsWithChildren<{
  /**
   * Novo contrato preferencial.
   *
   * Exemplo:
   * <PageGuard allowed={permissions.canList}>...</PageGuard>
   */
  allowed?: boolean;

  /**
   * Compatibilidade com telas antigas.
   * Não expõe nem lê permissões cruas do usuário: apenas traduz os códigos
   * antigos para capacidades booleanas via useAuthorization().
   */
  requiredPermissions?: string[];
  requiredModule?: string;
  requireAllPermissions?: boolean;
  fallback?: ReactNode;
}>;

export function PageGuard({
  children,
  allowed,
  requiredPermissions = [],
  requireAllPermissions = true,
  fallback,
}: PageGuardProps) {
  const { canRunPermissionCode, isSuperAdmin } = useAuthorization();

  const resolvedAllowed =
    typeof allowed === "boolean"
      ? allowed
      : requiredPermissions.length === 0
        ? true
        : requireAllPermissions
          ? requiredPermissions.every((permission) =>
              canRunPermissionCode(permission),
            )
          : requiredPermissions.some((permission) =>
              canRunPermissionCode(permission),
            );

  if (!resolvedAllowed && !isSuperAdmin) {
    return (
      fallback ?? (
        <div className="ck-register-alert">
          Você não possui permissão para acessar este conteúdo.
        </div>
      )
    );
  }

  return <>{children}</>;
}

export default PageGuard;
