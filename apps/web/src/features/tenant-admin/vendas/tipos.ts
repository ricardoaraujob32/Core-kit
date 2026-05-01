// apps/web/src/features/tenant-admin/vendas/tipos.ts

export type CriarVendaInput = {
  clienteId?: string | null;
};

export type CriarVendaResponse = {
  vendaId?: string;
  locatarioId?: string;
  clienteId?: string | null;
  criadoEm?: string;
};