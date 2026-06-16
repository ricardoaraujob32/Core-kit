// apps/api/src/modules/dashboard/dashboard.dto.ts

export type DashboardResumoDto = {
  clientes: number;
  fornecedores: number;
  produtos: number;
  estoques: number;
  ordensServicoAbertas: number;
  vendasMes: {
    quantidade: number;
    valor: number;
  };
  comprasMes: {
    quantidade: number;
    valor: number;
  };
};
