// packages/core/src/estoque/portasRepositorio.ts
// Finalidade: Porta (contrato) do repositório de estoque/catálogo/movimentos.

import type { LocatarioId } from "../locatario";
import type { Estoque, EstoqueId, Item, ItemId, MovimentoEstoque, TipoMovimentoEstoque, TipoItem,} from "./tipos";

export type RepositorioEstoque = {
  obterItemPorId(locatarioId: LocatarioId, id: ItemId): Promise<Item | null>;
  obterItemPorNome(locatarioId: LocatarioId, nome: string): Promise<Item | null>;
  listarItens(locatarioId: LocatarioId): Promise<Item[]>;
  criarItem(dados: { locatarioId: LocatarioId; tipo: TipoItem; nome: string }): Promise<Item>;

  obterEstoquePadrao(locatarioId: LocatarioId): Promise<Estoque | null>;
  criarEstoquePadrao(locatarioId: LocatarioId): Promise<Estoque>;

  registrarMovimento(dados: Omit<MovimentoEstoque, "id">): Promise<MovimentoEstoque>;
  obterSaldoAtual(locatarioId: LocatarioId, estoqueId: EstoqueId, itemId: ItemId): Promise<number>;
};
