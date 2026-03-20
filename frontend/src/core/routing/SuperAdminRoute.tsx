// frontend/src/core/routing/SuperAdminRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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

  if (!user.isSuperAdmin) {
    return <Navigate to={forbiddenPath} replace />;
  }

  return <Outlet />;
}

export default SuperAdminRoute;