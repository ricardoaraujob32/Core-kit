import { createErroApp } from "../kernel";
import type { TransacaoId, ItemTransacaoId } from "./tipos";

export function transacaoNaoEncontrada(transacaoId: TransacaoId) {
  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Transação comercial não encontrada.", detalhes: { operacao: "vendas.transacaoNaoEncontrada", transacaoId } });
}
export function itemTransacaoNaoEncontrado(itemTransacaoId: ItemTransacaoId) {
  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Item da transação não encontrado.", detalhes: { operacao: "vendas.itemNaoEncontrado", itemTransacaoId } });
}
export function transacaoNaoEditavel(transacaoId: TransacaoId) {
  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Transação não pode ser editada no estado atual.", detalhes: { operacao: "vendas.transacaoNaoEditavel", transacaoId } });
}
export function transacaoSemItens(transacaoId: TransacaoId) {
  return createErroApp({ codigo: "INVALIDO", mensagem: "Transação deve possuir ao menos um item.", detalhes: { operacao: "vendas.transacaoSemItens", transacaoId } });
}
export function transicaoTransacaoInvalida(transacaoId: TransacaoId, estadoAtual: string, evento: string) {
  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Transição de estado da transação inválida.", detalhes: { operacao: "vendas.transicaoInvalida", transacaoId, estadoAtual, evento } });
}
export function estoquePadraoNaoEncontrado() {
  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Estoque padrão não encontrado para o locatário.", detalhes: { operacao: "vendas.estoquePadraoNaoEncontrado" } });
}

export function transacaoNaoPermiteEdicao(transacaoId: TransacaoId) {
  return createErroApp({
    codigo: "REGRA_NEGOCIO",
    mensagem: "A transação não permite edição neste estado.",
    detalhes: {
      transacaoId,
      regra: "transacao.nao_permite_edicao",
    },
  });
}
