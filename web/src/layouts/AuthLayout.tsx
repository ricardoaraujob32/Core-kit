// frontend/src/layouts/AuthLayout.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../core/auth/useAuth";
import { isSuperAdmin } from "../core/auth/types";

export default function AuthLayout(): JSX.Element {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={isSuperAdmin(user) ? "/superadmin" : "/app"}
        replace
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        <Outlet />
      </div>
    </div>
  );
}