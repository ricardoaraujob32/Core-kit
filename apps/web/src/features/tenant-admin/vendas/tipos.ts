// apps/web/src/features/tenant-admin/vendas/tipos.ts

export type CriarVendaInput = {
  clienteId?: string | null;
  observacao?: string | null;
};

export type CriarVendaResponse = {
  item: {
    transacaoId: string;
  };
};