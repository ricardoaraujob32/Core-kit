// packages/core/src/vendas/usecases/confirmarTransacao.ts

import { createErroApp, executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import type { VendasRepositorio } from "../portasRepositorio";
import type { ConfirmarTransacaoInput, ConfirmarTransacaoOutput, ConfirmarTransacaoResult } from "../tipos";
import { transacaoNaoEncontrada, transacaoSemItens } from "../erros";
import { transicionarEstadoTransacao } from "../maquinaEstados";
import { validarLocatarioId, validarTransacaoId } from "../validadores";
import { criarHistoricoTransacao } from "./helpers";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnConfirmarTransacao(deps: { 
  vendasRepositorio: VendasRepositorio;
  idPorta: IdPorta; relogio: RelogioPorta;
  transacao?: TransacaoPorta }) {
  /**
   * 
   */
  return async function confirmarTransacao(input: ConfirmarTransacaoInput): ConfirmarTransacaoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const transacaoId = validarTransacaoId(input.transacaoId);
    if (!transacaoId.ok) return transacaoId;
    
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.vendasRepositorio.buscarTransacaoPorId({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); 
      if (!atual.ok) return atual;
      if (!atual.value) return transacaoNaoEncontrada(transacaoId.value);

      const itens = await deps.vendasRepositorio.listarItens({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); 
      if (!itens.ok) return itens;
      if (itens.value.length === 0) return transacaoSemItens(transacaoId.value);
      
      const transicao = transicionarEstadoTransacao({ transacaoId: transacaoId.value, statusAtual: atual.value.status, evento: "CONFIRMAR" }); 
      if (!transicao.ok) return transicao;

      const atualizado = await deps.vendasRepositorio.atualizarTransacao({ ...atual.value, status: transicao.value, atualizadoEm: deps.relogio.agora() }); 
      if (!atualizado.ok) return atualizado;

      const ocorridoEm = deps.relogio.agora();
      const tipoMovimento = atualizado.value.tipo === "COMPRA" ? "ENTRADA" : "SAIDA";

      for (const item of itens.value) {
        if (!item.movimentaEstoque) continue;

        if (!item.estoqueId) {
          return createErroApp({
            codigo: "INVALIDO",
            mensagem: "Item que movimenta estoque precisa ter estoque informado.",
            detalhes: {
              operacao: "vendas.confirmarTransacao.movimentarEstoque",
              transacaoId: transacaoId.value,
              itemTransacaoId: item.itemTransacaoId,
              produtoId: item.produtoId,
            },
          });
        }

        const movimento = await deps.vendasRepositorio.registrarMovimentoEstoque({
          locatarioId: locatarioId.value,
          estoqueId: item.estoqueId,
          produtoId: item.produtoId,
          transacaoId: transacaoId.value,
          itemTransacaoId: item.itemTransacaoId,
          tipo: tipoMovimento,
          quantidade: item.quantidade,
          ocorridoEm,
        });

        if (!movimento.ok) return movimento;
      }

      const hist = await deps.vendasRepositorio.criarHistorico(criarHistoricoTransacao({ 
        idPorta: deps.idPorta, 
        relogio: deps.relogio, transacao: 
        atualizado.value, 
        evento: "CONFIRMAR", 
        resumo: "Transação confirmada.", 
        usuarioId: input.usuarioId, 
        statusAnterior: atual.value.status, 
        statusNovo: atualizado.value.status 
      })); 
      if (!hist.ok) return hist;
      
      return wrapOk<ConfirmarTransacaoOutput>({ 
        transacao: atualizado.value 
      });
    });
  };
}
