// apps/web/src/layouts/tenantLayout.tsx

import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../core/auth/useAuth";
import { JSX } from "react";

/**
 * 
 * @returns 
 */
export default function TenantLayout(): JSX.Element {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        color: "#111827",
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
            <strong>Mini SaaS Admin</strong>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              Área administrativa do locatário
            </div>
          </div>

          <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <NavLink to="/app">Dashboard</NavLink>
            <NavLink to="/app/usuarios">Usuários</NavLink>
            <NavLink to="/app/locatario">Locatário</NavLink>
            <NavLink to="/app/locatario/configuracoes">Configurações</NavLink>
            <NavLink to="/app/assinatura/modulos">Módulos</NavLink>
            <NavLink to="/app/minha-senha">Minha senha</NavLink>
            <NavLink to="/app/clientes">Cliente</NavLink>
            <NavLink to="/app/fornecedores">Fornecedor</NavLink>
            <NavLink to="/app/produtos">Produto</NavLink>
            <NavLink to="/app/transacoes">Transações</NavLink>
            <NavLink to="/app/vendas/nova">Nova venda</NavLink>
            <NavLink to="/app/compras/nova">Nova compra</NavLink>

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
