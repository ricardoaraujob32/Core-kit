import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import type { VendasRepositorio } from "../portasRepositorio";
import type { CancelarTransacaoInput, CancelarTransacaoOutput, CancelarTransacaoResult } from "../tipos";
import { transacaoNaoEncontrada } from "../erros";
import { transicionarEstadoTransacao } from "../maquinaEstados";
import { validarLocatarioId, validarTextoOpcional, validarTransacaoId } from "../validadores";
import { criarHistoricoTransacao } from "./helpers";

export function createFnCancelarTransacao(deps: { vendasRepositorio: VendasRepositorio; idPorta: IdPorta; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function cancelarTransacao(input: CancelarTransacaoInput): CancelarTransacaoResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const transacaoId = validarTransacaoId(input.transacaoId); if (!transacaoId.ok) return transacaoId;
    const motivo = validarTextoOpcional(input.motivo); if (!motivo.ok) return motivo;
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.vendasRepositorio.buscarTransacaoPorId({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); if (!atual.ok) return atual;
      if (!atual.value) return transacaoNaoEncontrada(transacaoId.value);
      const transicao = transicionarEstadoTransacao({ transacaoId: transacaoId.value, statusAtual: atual.value.status, evento: "CANCELAR" }); if (!transicao.ok) return transicao;
      const agora = deps.relogio.agora();
      const atualizado = await deps.vendasRepositorio.atualizarTransacao({ ...atual.value, status: transicao.value, atualizadoEm: agora, canceladoEm: agora, canceladoPor: input.usuarioId ?? null, canceladoMotivo: motivo.value }); if (!atualizado.ok) return atualizado;
      const hist = await deps.vendasRepositorio.criarHistorico(criarHistoricoTransacao({ idPorta: deps.idPorta, relogio: deps.relogio, transacao: atualizado.value, evento: "CANCELAR", resumo: "Transação cancelada.", usuarioId: input.usuarioId, statusAnterior: atual.value.status, statusNovo: atualizado.value.status, detalhes: { motivo: motivo.value } })); if (!hist.ok) return hist;
      return wrapOk<CancelarTransacaoOutput>({ transacao: atualizado.value });
    });
  };
}
