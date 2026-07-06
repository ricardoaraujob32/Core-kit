// apps/web/src/shared/pwa/offlineTransacaoItemTypes.ts

export type AdicionarItemTransacaoOfflinePayload = {
  transacaoId: string;
  produtoId: string;
  quantidade: number;
  valorUnitario?: number | null;
  valorDesconto?: number | null;
  descricao?: string | null;
};

export type AtualizarItemTransacaoOfflinePayload = {
  transacaoId: string;
  itemTransacaoId: string;
  quantidade?: number;
  valorUnitario?: number;
  valorDesconto?: number;
  descricao?: string | null;
};

export type RemoverItemTransacaoOfflinePayload = {
  transacaoId: string;
  itemTransacaoId: string;
};
