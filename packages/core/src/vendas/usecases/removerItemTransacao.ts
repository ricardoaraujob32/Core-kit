// 

import type { VendasRepositorio } from "../portasRepositorio.js";
import type {
  RemoverItemTransacaoInput,
  RemoverItemTransacaoOutput,
  RemoverItemTransacaoResult,
} from "../tipos.js";
import {
  validarItemTransacaoId,
  validarLocatarioId,
  validarTransacaoId,
} from "../validadores.js";
import {
  itemTransacaoNaoEncontrado,
  transacaoNaoEncontrada,
  transacaoNaoPermiteEdicao,
} from "../erros.js";
import {
  executarEmTransacao,
  RelogioPorta,
  TransacaoPorta,
  wrapOk,
} from "../../kernel/index.js";

function podeEditarTransacao(status: string) {
  return status === "RASCUNHO" || status === "ABERTA";
}

export function createFnRemoverItemTransacao(deps: {
  vendasRepositorio: VendasRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  return async function removerItemTransacao(
    input: RemoverItemTransacaoInput,
  ): RemoverItemTransacaoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const transacaoId = validarTransacaoId(input.transacaoId);
    if (!transacaoId.ok) return transacaoId;

    const itemTransacaoId = validarItemTransacaoId(input.itemTransacaoId);
    if (!itemTransacaoId.ok) return itemTransacaoId;

    return executarEmTransacao(deps.transacao, async () => {
      const transacaoAtual = await deps.vendasRepositorio.buscarTransacaoPorId({
        locatarioId: locatarioId.value,
        transacaoId: transacaoId.value,
      });
      if (!transacaoAtual.ok) return transacaoAtual;
      if (!transacaoAtual.value) return transacaoNaoEncontrada(transacaoId.value);

      if (!podeEditarTransacao(transacaoAtual.value.status)) {
        return transacaoNaoPermiteEdicao(transacaoId.value);
      }

      const itemAtual = await deps.vendasRepositorio.buscarItemPorId({
        locatarioId: locatarioId.value,
        transacaoId: transacaoId.value,
        itemTransacaoId: itemTransacaoId.value,
      });
      if (!itemAtual.ok) return itemAtual;
      if (!itemAtual.value) return itemTransacaoNaoEncontrado(itemTransacaoId.value);

      const removido = await deps.vendasRepositorio.removerItem({
        locatarioId: locatarioId.value,
        transacaoId: transacaoId.value,
        itemTransacaoId: itemTransacaoId.value,
      });
      if (!removido.ok) return removido;

      const itens = await deps.vendasRepositorio.listarItensPorTransacao({
        locatarioId: locatarioId.value,
        transacaoId: transacaoId.value,
      });
      if (!itens.ok) return itens;

      const valorSubtotal = itens.value.reduce(
        (total: number, item) => total + item.quantidade * item.valorUnitario, 0,
      );

      const valorDesconto = itens.value.reduce(
        (total: number, item) => total + item.valorDesconto, 0,
      );

      const valorTotal =
        valorSubtotal - valorDesconto + transacaoAtual.value.valorAcrescimo;

      const atualizado = await deps.vendasRepositorio.atualizarTransacao({
        ...transacaoAtual.value,
        valorSubtotal,
        valorDesconto,
        valorTotal,
        atualizadoEm: deps.relogio.agora(),
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<RemoverItemTransacaoOutput>({
        transacao: atualizado.value,
      });
    });
  };
}