// apps/api/src/modules/vendas/vendas.presenter.ts

import type { ItemTransacaoComercial, TransacaoComercial } from "@core-kit/core";

export function toTransacaoResponseDto(transacao: TransacaoComercial) {
  return {
    transacaoId: transacao.transacaoId,
    locatarioId: transacao.locatarioId,
    tipo: transacao.tipo,
    clienteId: transacao.clienteId,
    fornecedorId: transacao.fornecedorId,
    status: transacao.status,
    valorSubtotal: transacao.valorSubtotal,
    valorDesconto: transacao.valorDesconto,
    valorAcrescimo: transacao.valorAcrescimo,
    valorTotal: transacao.valorTotal,
    observacao: transacao.observacao,
    criadoEm: transacao.criadoEm,
    atualizadoEm: transacao.atualizadoEm,
    canceladoEm: transacao.canceladoEm,
  };
}

export function toItemTransacaoResponseDto(item: ItemTransacaoComercial) {
  return {
    itemTransacaoId: item.itemTransacaoId,
    transacaoId: item.transacaoId,
    locatarioId: item.locatarioId,
    produtoId: item.produtoId,
    estoqueId: item.estoqueId,
    descricao: item.descricao,
    tipoProduto: item.tipoProduto,
    quantidade: item.quantidade,
    valorUnitario: item.valorUnitario,
    valorSubtotal: item.valorSubtotal,
    valorDesconto: item.valorDesconto,
    valorAcrescimo: item.valorAcrescimo,
    valorTotal: item.valorTotal,
    movimentaEstoque: item.movimentaEstoque,
    criadoEm: item.criadoEm,
    atualizadoEm: item.atualizadoEm,
  };
}

export function toListarTransacoesResponseDto(itens: TransacaoComercial[]) {
  return itens.map(toTransacaoResponseDto);
}

export function toTransacaoDetalhadaResponseDto(input: {
  transacao: TransacaoComercial;
  itens: ItemTransacaoComercial[];
}) {
  return {
    ...toTransacaoResponseDto(input.transacao),
    itens: input.itens.map(toItemTransacaoResponseDto),
  };
}