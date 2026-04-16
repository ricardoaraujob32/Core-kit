// frontend/src/layouts/SuperAdminLayout.tsx

import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../core/auth/useAuth";
import { JSX } from "react";

export default function SuperAdminLayout(): JSX.Element {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb", color: "#111827" }}>
      <header
        style={{
          borderBottom: "1px solid #d1d5db",
          background: "#ffffff",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <strong>Painel SuperAdmin</strong>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              Plataforma
            </div>
          </div>

          <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <NavLink to="/superadmin">Dashboard</NavLink>
            <NavLink to="/superadmin/locatarios">Locatários</NavLink>

            <span style={{ fontSize: 14, color: "#6b7280" }}>
              {user?.email ?? user?.nome ?? user?.usuarioId ?? "Usuário autenticado"}
            </span>

            <button type="button" onClick={handleLogout}>
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}