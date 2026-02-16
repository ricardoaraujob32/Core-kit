export type TipoItem = "PRODUTO" | "SERVICO";
export type TipoMovimentoEstoque = "ENTRADA" | "SAIDA" | "AJUSTE";

export type ItemId = string;
export type EstoqueId = string;

export type Item = {
  id: ItemId;
  tipoItem: TipoItem;
  nome: string;
  unidade: string;
  sku?: string | null;
  ativo: boolean;
  excluidoEm?: Date | null;
};

export type NovoItem = {
  tipoItem: TipoItem;
  nome: string;
  unidade: string;
  sku?: string | null;
};

export type MovimentoEstoqueId = string;

export type NovoMovimentoEstoque = {
  estoqueId?: EstoqueId | null;
  itemId: ItemId;
  tipo: TipoMovimentoEstoque;
  delta: number;
  referencia?: string | null;
  observacao?: string | null;
};

export type SaldoEstoque = {
  quantidade: number;
};
