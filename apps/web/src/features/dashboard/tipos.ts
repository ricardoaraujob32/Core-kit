// apps/web/src/features/dashboard/tipos.ts

export type DashboardResumo = {
  totalClientes: number;
  totalFornecedores: number;
  totalProdutos: number;
  totalItensEstoque: number;

  vendasMes: number;
  comprasMes: number;

  ordensServicoAbertas: number;
};

export type DashboardResumoResponse = {
  item: DashboardResumo;
};