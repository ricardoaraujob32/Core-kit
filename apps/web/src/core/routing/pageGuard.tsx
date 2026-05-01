// apps/web/src/core/routing/pageGuard.tsx

import type { PropsWithChildren, ReactNode } from "react";
import { useAuthorization } from "../auth/useAuthorization";

type PageGuardProps = PropsWithChildren<{
  requiredPermissions?: string[];
  requiredModule?: string;
  requireAllPermissions?: boolean;
  fallback?: ReactNode;
}>;

function hasRequiredPermissions(currentPermissions: string[], requiredPermissions: string[], requireAllPermissions: boolean): boolean {
  if (requiredPermissions.length === 0) {
    return true;
  }

  if (requireAllPermissions) {
    return requiredPermissions.every((permission) =>
      currentPermissions.includes(permission),
    );
  }

  return requiredPermissions.some((permission) =>
    currentPermissions.includes(permission),
  );
}

export function PageGuard({ children, requiredPermissions = [], requiredModule, requireAllPermissions = true, fallback }: PageGuardProps) {
  const { hasModule, permissions } = useAuthorization();

  if (requiredModule && !hasModule(requiredModule)) {
    return (
      fallback ?? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Você não possui acesso a este módulo.
        </div>
      )
    );
  }

  const ok = hasRequiredPermissions(
    permissions,
    requiredPermissions,
    requireAllPermissions,
  );

  if (!ok) {
    return (
      fallback ?? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Você não possui permissão para acessar este conteúdo.
        </div>
      )
    );
  }

  return <>{children}</>;
}