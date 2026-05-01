// apps/web/src/layouts/authLayout.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../core/auth/useAuth";
import { JSX } from "react";

export default function AuthLayout(): JSX.Element {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        <Outlet />
      </div>
    </div>
  );
}
