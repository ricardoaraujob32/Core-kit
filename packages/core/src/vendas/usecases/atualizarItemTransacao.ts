// packages/core/src/vendas/usecases/atualizarItemTransacao.ts

import type { VendasRepositorio } from "../portasRepositorio.js";
import type { AtualizarItemTransacaoInput, AtualizarItemTransacaoOutput, AtualizarItemTransacaoResult, ItemTransacaoComercial } from "../tipos.js";
import { validarItemTransacaoId, validarLocatarioId, validarQuantidadeItem, validarTransacaoId, validarValorDesconto, validarValorUnitario } from "../validadores.js";
import { itemTransacaoNaoEncontrado, transacaoNaoEncontrada, transacaoNaoPermiteEdicao } from "../erros.js";
import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel/index.js";

function podeEditarTransacao(status: string) {
  return status === "RASCUNHO" || status === "ABERTA";
}

function calcularValorTotalItem(params: {
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  valorAcrescimo: number;
}) {
  return (params.quantidade * params.valorUnitario - params.valorDesconto + params.valorAcrescimo);
}

function calcularTotaisTransacao(params: { itens: ItemTransacaoComercial[]; valorAcrescimo: number; }) {
  const valorSubtotal = params.itens.reduce( (total, item) => total + item.quantidade * item.valorUnitario, 0);
  const valorDesconto = params.itens.reduce( (total, item) => total + item.valorDesconto, 0);

  return {
    valorSubtotal,
    valorDesconto,
    valorTotal: valorSubtotal - valorDesconto + params.valorAcrescimo,
  };
}

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAtualizarItemTransacao(deps: {
  vendasRepositorio: VendasRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   */  
  return async function atualizarItemTransacao(input: AtualizarItemTransacaoInput): AtualizarItemTransacaoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const transacaoId = validarTransacaoId(input.transacaoId);
    if (!transacaoId.ok) return transacaoId;

    const itemTransacaoId = validarItemTransacaoId(input.itemTransacaoId);
    if (!itemTransacaoId.ok) return itemTransacaoId;

    const quantidade = input.quantidade !== undefined ? validarQuantidadeItem(input.quantidade) : null;
    if (quantidade && !quantidade.ok) return quantidade;

    const valorUnitario = input.valorUnitario !== undefined ? validarValorUnitario(input.valorUnitario) : null;
    if (valorUnitario && !valorUnitario.ok) return valorUnitario;

    const valorDesconto = input.valorDesconto !== undefined ? validarValorDesconto(input.valorDesconto) : null;
    if (valorDesconto && !valorDesconto.ok) return valorDesconto;

    return executarEmTransacao(deps.transacao, async () => {
      const transacaoAtual = await deps.vendasRepositorio.buscarTransacaoPorId({
        locatarioId: locatarioId.value,
        transacaoId: transacaoId.value,
      });
      if (!transacaoAtual.ok) return transacaoAtual;
      if (!transacaoAtual.value) {
        return transacaoNaoEncontrada(transacaoId.value);
      }

      if (!podeEditarTransacao(transacaoAtual.value.status)) {
        return transacaoNaoPermiteEdicao(transacaoId.value);
      }

      const itemAtual = await deps.vendasRepositorio.buscarItemPorId({
        locatarioId: locatarioId.value,
        transacaoId: transacaoId.value,
        itemTransacaoId: itemTransacaoId.value,
      });
      if (!itemAtual.ok) return itemAtual;
      if (!itemAtual.value) {
        return itemTransacaoNaoEncontrado(itemTransacaoId.value);
      }

      const quantidadeFinal = quantidade?.value ?? itemAtual.value.quantidade;
      const valorUnitarioFinal = valorUnitario?.value ?? itemAtual.value.valorUnitario;
      const valorDescontoFinal = valorDesconto?.value ?? itemAtual.value.valorDesconto;
      const valorAcrescimoFinal = input.valorAcrescimo ?? itemAtual.value.valorAcrescimo ?? 0;

      const itemAtualizado = await deps.vendasRepositorio.atualizarItem({
        ...itemAtual.value,
        descricao: input.descricao !== undefined ? input.descricao?.trim() || itemAtual.value.descricao : itemAtual.value.descricao,
        quantidade: quantidadeFinal,
        valorUnitario: valorUnitarioFinal,
        valorDesconto: valorDescontoFinal,
        valorAcrescimo: valorAcrescimoFinal,
        valorSubtotal: quantidadeFinal * valorUnitarioFinal,
        valorTotal: calcularValorTotalItem({
          quantidade: quantidadeFinal,
          valorUnitario: valorUnitarioFinal,
          valorDesconto: valorDescontoFinal,
          valorAcrescimo: valorAcrescimoFinal,
        }),
        atualizadoEm: deps.relogio.agora(),
      });
      if (!itemAtualizado.ok) return itemAtualizado;

      const itens = await deps.vendasRepositorio.listarItensPorTransacao({
        locatarioId: locatarioId.value,
        transacaoId: transacaoId.value,
      });
      if (!itens.ok) return itens;

      const totais = calcularTotaisTransacao({
        itens: itens.value,
        valorAcrescimo: transacaoAtual.value.valorAcrescimo,
      });

      const transacaoAtualizada =
        await deps.vendasRepositorio.atualizarTransacao({
          ...transacaoAtual.value,
          ...totais,
          atualizadoEm: deps.relogio.agora(),
        });
      if (!transacaoAtualizada.ok) return transacaoAtualizada;

      return wrapOk<AtualizarItemTransacaoOutput>({
        item: itemAtualizado.value,
        transacao: transacaoAtualizada.value,
      });
    });
  };
}