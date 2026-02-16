import type { Result } from "../result";
import type { ErroApp } from "../erros";
import type { EstoqueId, Item, ItemId, MovimentoEstoqueId, NovoItem, NovoMovimentoEstoque, SaldoEstoque } from "./tipos";

export type RepositorioItens = {
  criarItem(novoItem: NovoItem): Promise<Result<{ id: ItemId }, ErroApp>>;
  buscarItemPorId(itemId: ItemId): Promise<Result<Item | null, ErroApp>>;
};

export type RepositorioEstoque = {
  garantirEstoquePadrao(): Promise<Result<{ estoqueId: EstoqueId }, ErroApp>>;

  registrarMovimentoEAtualizarSaldo(input: {
    estoqueId: EstoqueId;
    itemId: ItemId;
    tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
    delta: number;
    referencia?: string | null;
    observacao?: string | null;
  }): Promise<Result<{ movimentoId: MovimentoEstoqueId }, ErroApp>>;

  obterSaldo(input: { estoqueId: EstoqueId; itemId: ItemId }): Promise<Result<SaldoEstoque, ErroApp>>;
};
