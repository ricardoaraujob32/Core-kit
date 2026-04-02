// frontend/src/core/routing/SuperAdminRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isSuperAdmin } from "../auth/types";
import { useAuth } from "../auth/useAuth";

type SuperAdminRouteProps = {
  loginPath?: string;
  forbiddenPath?: string;
};

export function SuperAdminRoute({
  loginPath = "/login",
  forbiddenPath = "/acesso-negado",
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

  if (!isSuperAdmin(user)) {
    return <Navigate to={forbiddenPath} replace />;
  }

  return <Outlet />;
}

export default SuperAdminRoute;