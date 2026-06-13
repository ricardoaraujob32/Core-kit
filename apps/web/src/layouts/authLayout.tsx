// apps/web/src/layouts/authLayout.tsx

import type { JSX } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isPlataforma } from "../core/auth/tipos";
import { useAuth } from "../core/auth/useAuth";

export default function AuthLayout(): JSX.Element {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-700">
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
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-10">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
