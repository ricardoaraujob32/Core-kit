// apps/web/src/layouts/tenantLayout.tsx

import type { JSX } from "react";
import { Outlet } from "react-router-dom";
import { AppShell, type AppNavItem } from "../shared/layout";

const TENANT_NAV_ITEMS: AppNavItem[] = [
  { label: "Dashboard", to: "/app", end: true, icon: "📊" },
  { label: "Clientes", to: "/app/clientes", icon: "👥" },
  { label: "Fornecedores", to: "/app/fornecedores", icon: "🏢" },
  { label: "Produtos", to: "/app/produtos", icon: "📦" },
  { label: "Transações", to: "/app/transacoes", icon: "📄" },
  { label: "Nova venda", to: "/app/vendas/nova", icon: "💰" },
  { label: "Nova compra", to: "/app/compras/nova", icon: "🛒" },
  { label: "Usuários", to: "/app/usuarios", icon: "🔐" },
  { label: "Locatário", to: "/app/locatario", icon: "⚙️" },
  { label: "Módulos", to: "/app/assinatura/modulos", icon: "🧩" },
];

export default function TenantLayout(): JSX.Element {
  return (
    <AppShell navItems={TENANT_NAV_ITEMS} variant="tenant">
      <Outlet />
    </AppShell>
  );
}
