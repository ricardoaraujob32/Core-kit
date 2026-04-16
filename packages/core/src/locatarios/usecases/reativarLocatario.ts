// packages/core/src/locatarios/usecases/reativarLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, TransacaoPorta } from "../../kernel";
import type { ReativarLocatarioInput } from "../tipos";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { validarConfiguracoesLocatario, validarLocatarioId } from "../validadores";
import { locatarioNaoEncontrado } from "../erros";
import { transicionarEstadoLocatario } from "../maquinaEstados";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnReativarLocatario(deps: {
  locatarioRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   * @param input
   * @returns
   */
  return async function reativarLocatario(input: ReativarLocatarioInput) {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.locatarioRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
      });
      if (!atual.ok) return atual;
      if (!atual.value) return locatarioNaoEncontrado(locatarioId.value);

      const configuracoesOk = validarConfiguracoesLocatario(atual.value.configuracoes);
      if (!configuracoesOk.ok) return configuracoesOk;

      const transicao = transicionarEstadoLocatario({
        locatarioId: atual.value.locatarioId,
        statusAtual: atual.value.status,
        evento: "REATIVAR",
      });
      if (!transicao.ok) return transicao;

      const agora = deps.relogio.agora();

      const atualizado = await deps.locatarioRepositorio.atualizar({
        ...atual.value,
        status: transicao.value,
        reativadoEm: agora,
        motivoReativacao: input.motivoReativacao?.trim() || null,
        atualizadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk({
        locatario: atualizado.value,
      });
    });
  };
}
