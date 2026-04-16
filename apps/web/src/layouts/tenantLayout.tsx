// apps/web/src/layouts/tenantLayout.tsx

import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../core/auth/useAuth";
import { useTenant } from "../core/tenant/useTenant";
import { JSX } from "react";

export default function TenantLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const { branding, isLoading } = useTenant();

  async function handleLogout() {
    await logout();
  }

  const nomeAplicacao = branding?.nomeFantasia ?? "Área do Locatário";
  const corPrimaria = branding?.corPrimaria ?? "var(--tenant-color-primary)";
  const corFundo = branding?.corFundo ?? "var(--tenant-color-background)";
  const corTexto = branding?.corTexto ?? "var(--tenant-color-text)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: corFundo,
        color: corTexto,
      }}
    >
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
            <strong style={{ color: corPrimaria }}>
              {nomeAplicacao}
            </strong>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              {isLoading
                ? "Carregando identidade visual..."
                : "Área administrativa do locatário"}
            </div>
          </div>

          <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <NavLink to="/app">Dashboard</NavLink>
            <NavLink to="/app/usuarios">Usuários</NavLink>
            <NavLink to="/app/locatario">Locatário</NavLink>
            <NavLink to="/app/locatario/configuracoes">Configurações</NavLink>


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

