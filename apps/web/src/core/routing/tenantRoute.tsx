// apps/web/src/core/routing/tenantRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthorization } from "../auth/useAuthorization";
import { JSX } from "react";

type TenantRouteProps = {
  requiredPermissions?: string[];
  requiredModule?: string;
  requireAllPermissions?: boolean;
  loginPath?: string;
  forbiddenPath?: string;
};

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

export function TenantRoute({ requiredPermissions = [], requiredModule, requireAllPermissions = true, loginPath = "/login", forbiddenPath = "/acesso-negado"}: TenantRouteProps): JSX.Element {
  const location = useLocation();
  const { isAuthenticated, user, permissions, hasModule } = useAuthorization();

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location }}
      />
    );
  }

  if (!user.locatarioId || user.locatarioId.trim() === "") {
    return <Navigate to={forbiddenPath} replace />;
  }

  if (requiredModule && !hasModule(requiredModule)) {
    return <Navigate to={forbiddenPath} replace />;
  }

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
