// apps/web/src/shared/navigation/tenantNavigationLabels.ts

export const TENANT_NAVIGATION_LABELS = {
  dashboard: "Início",
  usuarios: "Usuários",
  locatario: "Meu locatário",
  assinatura: "Assinatura",
  clientes: "Clientes",
  fornecedores: "Fornecedores",
  produtos: "Produtos",
  transacoes: "Transações",
  vendas: "Vendas",
  compras: "Compras",
  financeiro: "Financeiro",
  ordensServico: "Ordens de serviço",
  novo: "Novo",
  editar: "Editar",
  detalhes: "Detalhes",
} as const;

export type TenantNavigationLabelKey = keyof typeof TENANT_NAVIGATION_LABELS;

export function getTenantNavigationLabel(
  key: TenantNavigationLabelKey,
): string {
  return TENANT_NAVIGATION_LABELS[key];
}
