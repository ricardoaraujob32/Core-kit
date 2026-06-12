// packages/core/src/locatarios/usecases/suspenderLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, TransacaoPorta } from "../../kernel";
import type { SuspenderLocatarioInput } from "../tipos";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { transicionarEstadoLocatario } from "../maquinaEstados";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas";
import { obterLocatarioObrigatorio } from "./helpers";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnSuspenderLocatario(deps: {
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
  return async function suspenderLocatario(input: SuspenderLocatarioInput) {
    return executarEmTransacao(deps.transacao, async () => {
      const locatario = await obterLocatarioObrigatorio({
        locatariosRepositorio: deps.locatariosRepositorio,
        locatarioId: input.locatarioId,
      });
      if (!locatario.ok) return locatario;

      const autorizacao = await autorizarLocatario(deps, {
        operacao: "LOCATARIO_SUSPENDER",
        locatarioId: locatario.value.locatarioId,
        locatario: locatario.value,
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const transicao = transicionarEstadoLocatario({
        locatarioId: locatario.value.locatarioId,
        statusAtual: locatario.value.status,
        evento: "SUSPENDER",
      });
      if (!transicao.ok) return transicao;

      const agora = deps.relogio.agora();

      const atualizado = await deps.locatariosRepositorio.atualizar({
        ...locatario.value,
        status: transicao.value,
        suspensoEm: agora,
        motivoSuspensao: input.motivoSuspensao?.trim() || null,
        atualizadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk({
        locatario: atualizado.value,
      });
    });
  };
}
