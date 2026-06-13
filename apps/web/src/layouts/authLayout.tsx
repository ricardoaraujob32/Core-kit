// apps/web/src/layouts/authLayout.tsx

import type { JSX } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isPlataforma } from "../core/auth/tipos";
import { useAuth } from "../core/auth/useAuth";
import "../features/auth/pages/login.css";

export default function AuthLayout(): JSX.Element {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="ck-auth-page">
        <div className="ck-auth-loading">Carregando...</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Navigate to={isPlataforma(user) ? "/plataforma" : "/app"} replace />
    );
  }

  return (
    <div className="ck-auth-page">
      <Outlet />
    </div>
  );
}
