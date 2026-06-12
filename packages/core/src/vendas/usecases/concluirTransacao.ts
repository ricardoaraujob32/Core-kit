import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel/index.js";
import type { MovimentacaoEstoquePorta, VendasRepositorio } from "../portasRepositorio.js";
import type { ConcluirTransacaoInput, ConcluirTransacaoOutput, ConcluirTransacaoResult } from "../tipos.js";
import { transacaoNaoEncontrada, transacaoSemItens } from "../erros.js";
import { transicionarEstadoTransacao } from "../maquinaEstados.js";
import { validarLocatarioId, validarTransacaoId } from "../validadores.js";
import { criarHistoricoTransacao } from "./helpers.js";

export function createFnConcluirTransacao(deps: { vendasRepositorio: VendasRepositorio; movimentacaoEstoque?: MovimentacaoEstoquePorta; idPorta: IdPorta; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function concluirTransacao(input: ConcluirTransacaoInput): ConcluirTransacaoResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const transacaoId = validarTransacaoId(input.transacaoId); if (!transacaoId.ok) return transacaoId;
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.vendasRepositorio.buscarTransacaoPorId({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); if (!atual.ok) return atual;
      if (!atual.value) return transacaoNaoEncontrada(transacaoId.value);
      const itens = await deps.vendasRepositorio.listarItens({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); if (!itens.ok) return itens;
      if (itens.value.length === 0) return transacaoSemItens(transacaoId.value);
      const transicao = transicionarEstadoTransacao({ transacaoId: transacaoId.value, statusAtual: atual.value.status, evento: "CONCLUIR" }); if (!transicao.ok) return transicao;
      const agora = deps.relogio.agora();
      if (deps.movimentacaoEstoque) {
        for (const item of itens.value.filter((i) => i.movimentaEstoque && i.estoqueId)) {
          const mov = await deps.movimentacaoEstoque.registrarMovimento({ locatarioId: locatarioId.value, estoqueId: item.estoqueId!, produtoId: item.produtoId, transacaoId: transacaoId.value, itemTransacaoId: item.itemTransacaoId, tipo: atual.value.tipo === "VENDA" ? "SAIDA" : "ENTRADA", quantidade: item.quantidade, ocorridoEm: agora });
          if (!mov.ok) return mov;
        }
      }
      const atualizado = await deps.vendasRepositorio.atualizarTransacao({ ...atual.value, status: transicao.value, atualizadoEm: agora }); if (!atualizado.ok) return atualizado;
      const hist = await deps.vendasRepositorio.criarHistorico(criarHistoricoTransacao({ idPorta: deps.idPorta, relogio: deps.relogio, transacao: atualizado.value, evento: "CONCLUIR", resumo: "Transação concluída.", usuarioId: input.usuarioId, statusAnterior: atual.value.status, statusNovo: atualizado.value.status })); if (!hist.ok) return hist;
      return wrapOk<ConcluirTransacaoOutput>({ transacao: atualizado.value });
    });
  };
}
