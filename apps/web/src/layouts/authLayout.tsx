// apps/web/src/layouts/authLayout.tsx

import type { JSX } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isPlataforma } from "../core/auth/tipos";
import { useAuth } from "../core/auth/useAuth";

export default function AuthLayout(): JSX.Element {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        Carregando...
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={isPlataforma(user) ? "/plataforma" : "/app"}
        replace
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
