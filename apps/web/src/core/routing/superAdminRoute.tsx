// apps/web/src/core/routing/superAdminRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { JSX } from "react";

type SuperAdminRouteProps = {
  loginPath?: string;
  forbiddenPath?: string;
  fallbackPath?: string;
};

export function SuperAdminRoute({ loginPath = "/login", fallbackPath = "/app" }: SuperAdminRouteProps): JSX.Element {
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

  return <Navigate to={fallbackPath} replace />;
}

export default SuperAdminRoute;