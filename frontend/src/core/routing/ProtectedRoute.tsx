import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { PermissionCode } from "../types/permissions";

type ProtectedRouteProps = {
  requiredPermissions?: readonly PermissionCode[];
  requireAll?: boolean;
};

export function ProtectedRoute({
  requiredPermissions,
  requireAll = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, hasPermission } = useAuth();

  if (isBootstrapping) {
    return <div style={{ padding: 24 }}>Carregando sessão...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const checks = requiredPermissions.map((permission) => hasPermission(permission));
    const allowed = requireAll ? checks.every(Boolean) : checks.some(Boolean);

    if (!allowed) {
      return <Navigate to="/acesso-negado" replace />;
    }
  }

  return <Outlet />;
}