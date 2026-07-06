// apps/web/src/shared/pwa/offlineTransacaoTypes.ts

export type CriarVendaOfflinePayload = {
  clienteId?: string | null;
  observacao?: string | null;
};

export type CriarCompraOfflinePayload = {
  fornecedorId?: string | null;
  observacao?: string | null;
};
