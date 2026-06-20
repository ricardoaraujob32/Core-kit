// apps/web/src/shared/navigation/tenantNavigationIcons.tsx

import type { JSX } from "react";

export type TenantNavigationIconKey =
  | "inicio"
  | "dashboard"
  | "clientes"
  | "fornecedores"
  | "produtos"
  | "transacoes"
  | "vendas"
  | "compras"
  | "financeiro"
  | "ordensServico"
  | "usuarios"
  | "locatario"
  | "assinatura"
  | "detalhes"
  | "editar"
  | "novo";

export const TENANT_NAVIGATION_ICONS: Record<TenantNavigationIconKey, string> = {
  inicio: "🏠",
  dashboard: "📊",
  clientes: "👥",
  fornecedores: "🏢",
  produtos: "📦",
  transacoes: "⇄",
  vendas: "🛒",
  compras: "🧾",
  financeiro: "💳",
  ordensServico: "🛠️",
  usuarios: "👤",
  locatario: "🏬",
  assinatura: "💰",
  detalhes: "🔎",
  editar: "✏️",
  novo: "＋",
};

export function getTenantNavigationIcon(
  iconKey?: TenantNavigationIconKey,
): string {
  if (!iconKey) return "•";
  return TENANT_NAVIGATION_ICONS[iconKey] ?? "•";
}

export function TenantNavigationIcon({
  iconKey,
  label,
}: {
  iconKey?: TenantNavigationIconKey;
  label: string;
}): JSX.Element {
  return (
    <span className="ck-breadcrumb-icon" title={label} aria-label={label}>
      {getTenantNavigationIcon(iconKey)}
    </span>
  );
}
