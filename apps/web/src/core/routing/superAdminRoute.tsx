// apps/web/src/core/routing/superAdminRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { isPlataforma } from "../auth/tipos";
import { JSX } from "react";

type SuperAdminRouteProps = {
  loginPath?: string;
  forbiddenPath?: string;
};

export function SuperAdminRoute({
  loginPath = "/login",
  forbiddenPath = "/app",
}: SuperAdminRouteProps): JSX.Element {
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

  if (!isPlataforma(user)) {
    return <Navigate to={forbiddenPath} replace />;
  }

  return <Outlet />;
}

export default SuperAdminRoute;