// apps/web/src/core/routing/tenantRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { isTenant } from "../auth/tipos";
import { JSX } from "react";

type TenantRouteProps = {
  loginPath?: string;
  forbiddenPath?: string;
};

export function TenantRoute({
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

  if (!isTenant(user) || !user.locatarioId) {
    return <Navigate to={forbiddenPath} replace />;
  }

  return <Outlet />;
}

export default TenantRoute;