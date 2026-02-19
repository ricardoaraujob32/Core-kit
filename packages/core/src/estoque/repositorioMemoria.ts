/**
 * Arquivo: packages/core/src/estoque/repositorioMemoria.ts
 * Finalidade: Implementação em memória de RepositorioEstoque (testes/dev).
 */

import type { RepositorioEstoque } from "./portasRepositorio";
import type { Estoque, EstoqueId, ItemCatalogo, ItemCatalogoId, MovimentoEstoque, MovimentoEstoqueId, TipoItemCatalogo } from "./tipos";

export function criarRepositorioEstoqueEmMemoria(): RepositorioEstoque {
  const itens: ItemCatalogo[] = [];
  const estoques: Estoque[] = [];
  const movimentos: MovimentoEstoque[] = [];

  let seqItem = 1;
  let seqEstoque = 1;
  let seqMov = 1;

  function novoIdItem(): ItemCatalogoId {
    return `item_${seqItem++}`;
  }

  function novoIdEstoque(): EstoqueId {
    return `est_${seqEstoque++}`;
  }

  function novoIdMovimento(): MovimentoEstoqueId {
    return `mov_${seqMov++}`;
  }

  return {
    async obterItemPorId(locatarioId, id) {
      return itens.find((i) => i.locatarioId === locatarioId && i.id === id) ?? null;
    },

    async obterItemPorNome(locatarioId, nome) {
      return itens.find((i) => i.locatarioId === locatarioId && i.nome === nome) ?? null;
    },

    async listarItens(locatarioId) {
      return itens.filter((i) => i.locatarioId === locatarioId);
    },

    async criarItem(dados: { locatarioId: string; tipo: TipoItemCatalogo; nome: string }) {
      const now = new Date();
      const item: ItemCatalogo = {
        id: novoIdItem(),
        locatarioId: dados.locatarioId,
        tipo: dados.tipo,
        nome: dados.nome,
        criadoEm: now,
        atualizadoEm: now,
      };
      itens.push(item);
      return item;
    },

    async obterEstoquePadrao(locatarioId) {
      return estoques.find((e) => e.locatarioId === locatarioId && e.padrao) ?? null;
    },

    async criarEstoquePadrao(locatarioId) {
      const now = new Date();
      const e: Estoque = {
        id: novoIdEstoque(),
        locatarioId,
        nome: "Estoque padrão",
        padrao: true,
        criadoEm: now,
      };
      estoques.push(e);
      return e;
    },

    async registrarMovimento(dados: Omit<MovimentoEstoque, "id">) {
      const mov: MovimentoEstoque = {
        ...dados,
        id: novoIdMovimento(),
      };
      movimentos.push(mov);
      return mov;
    },

    async obterSaldoAtual(locatarioId, estoqueId, itemId) {
      let saldo = 0;

      for (const m of movimentos) {
        if (m.locatarioId !== locatarioId) continue;
        if (m.estoqueId !== estoqueId) continue;
        if (m.itemId !== itemId) continue;

        if (m.tipo === "ENTRADA") saldo += m.quantidade;
        else if (m.tipo === "SAIDA") saldo -= m.quantidade;
        else if (m.tipo === "AJUSTE") saldo = m.quantidade; // ajuste define saldo final (simples e útil no MVP)
      }

      return saldo;
    },
  };
}
