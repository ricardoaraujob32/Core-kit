// packages/core/src/locatarios/usecases/reativarLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio.js";
import type { RelogioPorta, TransacaoPorta } from "../../kernel/index.js";
import type { ReativarLocatarioInput, ReativarLocatarioOutput, ReativarLocatarioResult } from "../tipos.js";
import { executarEmTransacao, wrapOk } from "../../kernel/index.js";
import { transicionarEstadoLocatario } from "../maquinaEstados.js";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas.js";
import { obterLocatarioObrigatorio } from "./helpers.js";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnReativarLocatario(deps: {
  locatariosRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaLocatariosPorta;
}) {
  /**
   * 
   * @param input
   * @returns
   */
  return async function reativarLocatario(input: ReativarLocatarioInput) : ReativarLocatarioResult {
    return executarEmTransacao(deps.transacao, async () => {
      const locatario = await obterLocatarioObrigatorio({
        locatariosRepositorio: deps.locatariosRepositorio,
        locatarioId: input.locatarioId,
      });
      if (!locatario.ok) return locatario;

      const autorizacao = await autorizarLocatario(deps, {
        operacao: "LOCATARIO_REATIVAR",
        locatarioId: locatario.value.locatarioId,
        locatario: locatario.value,
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const transicao = transicionarEstadoLocatario({
        locatarioId: locatario.value.locatarioId,
        statusAtual: locatario.value.status,
        evento: "REATIVAR",
      });
      if (!transicao.ok) return transicao;

      const agora = deps.relogio.agora();

      const atualizado = await deps.locatariosRepositorio.atualizar({
        ...locatario.value,
        status: transicao.value,
        reativadoEm: agora,
        motivoReativacao: input.motivoReativacao?.trim() || null,
        suspensoEm: null,
        motivoSuspensao: null,
        atualizadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<ReativarLocatarioOutput>({
        locatario: atualizado.value,
      });
    });
  };
}
