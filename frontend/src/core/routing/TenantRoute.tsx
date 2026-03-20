// frontend/src/core/routing/TenantRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Permissao } from "../auth/types";

type TenantRouteProps = {
  requiredPermissions?: Permissao[];
  requireAllPermissions?: boolean;
  loginPath?: string;
  forbiddenPath?: string;
};

function hasRequiredPermissions(
  currentPermissions: Permissao[],
  requiredPermissions: Permissao[],
  requireAllPermissions: boolean,
): boolean {
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

export function TenantRoute({
  requiredPermissions = [],
  requireAllPermissions = true,
  loginPath = "/login",
  forbiddenPath = "/acesso-negado",
}: TenantRouteProps): JSX.Element {
  const location = useLocation();
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <div>Carregando sessão...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location }}
      />
    );
  }

  if (user.isSuperAdmin) {
    return <Navigate to={forbiddenPath} replace />;
  }

  if (!user.locatarioId || user.locatarioId.trim() === "") {
    return <Navigate to={forbiddenPath} replace />;
  }

  const permissions = Array.isArray(user.permissoes) ? user.permissoes : [];
  const authorized = hasRequiredPermissions(
    permissions,
    requiredPermissions,
    requireAllPermissions,
  );

  if (!authorized) {
    return <Navigate to={forbiddenPath} replace />;
  }

  return <Outlet />;
}

export default TenantRoute;