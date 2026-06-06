// apps/web/src/core/routing/tenantRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { JSX } from "react";

type TenantRouteProps = {
  loginPath?: string;
  forbiddenPath?: string;
};

function isTenantLike(user: unknown): boolean {
  if (!user || typeof user !== "object") return false;

  const perfil = (user as { perfil?: string }).perfil;
  const locatarioId = (user as { locatarioId?: string | null }).locatarioId;

  return perfil === "TENANT" || Boolean(locatarioId);
}

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

  if (!isTenantLike(user)) {
    return <Navigate to={forbiddenPath} replace />;
  }

  return <Outlet />;
}

export default TenantRoute;