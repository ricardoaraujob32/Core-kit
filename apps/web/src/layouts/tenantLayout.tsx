// apps/web/src/layouts/tenantLayout.tsx

import type { JSX } from "react";
import { Outlet } from "react-router-dom";
import { AppShell, type AppNavItem } from "../shared/layout";

const TENANT_NAV_ITEMS: AppNavItem[] = [
  { label: "Dashboard", to: "/app", end: true },
  { label: "Clientes", to: "/app/clientes" },
  { label: "Fornecedores", to: "/app/fornecedores" },
  { label: "Produtos", to: "/app/produtos" },
  { label: "Transações", to: "/app/transacoes" },
  { label: "Nova venda", to: "/app/vendas/nova" },
  { label: "Nova compra", to: "/app/compras/nova" },
  { label: "Usuários", to: "/app/usuarios" },
  { label: "Locatário", to: "/app/locatario" },
  { label: "Módulos", to: "/app/assinatura/modulos" },
];

export default function TenantLayout(): JSX.Element {
  return (
    <AppShell navItems={TENANT_NAV_ITEMS} variant="tenant">
      <Outlet />
    </AppShell>
  );
}
