// packages/core/src/locatarios/usecases/encerrarLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, TransacaoPorta } from "../../kernel";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { transicionarEstadoLocatario } from "../maquinaEstados";
import { EncerrarLocatarioInput } from "../tipos";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas";
import { obterLocatarioObrigatorio } from "./helpers";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnEncerrarLocatario(deps: {
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
  return async function encerrarLocatario(input: EncerrarLocatarioInput) {
    return executarEmTransacao(deps.transacao, async () => {
      const locatario = await obterLocatarioObrigatorio({
        locatariosRepositorio: deps.locatariosRepositorio,
        locatarioId: input.locatarioId,
      });
      if (!locatario.ok) return locatario;

      const autorizacao = await autorizarLocatario(deps, {
        operacao: "LOCATARIO_ENCERRAR",
        locatarioId: locatario.value.locatarioId,
        locatario: locatario.value,
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const transicao = transicionarEstadoLocatario({
        locatarioId: locatario.value.locatarioId,
        statusAtual: locatario.value.status,
        evento: "ENCERRAR",
      });
      if (!transicao.ok) return transicao;

      const agora = deps.relogio.agora();

      const atualizado = await deps.locatariosRepositorio.atualizar({
        ...locatario.value,
        status: transicao.value,
        excluidoEm: agora,
        motivoExclusao: input.motivoExclusao?.trim() || null,
        atualizadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk({ locatario: atualizado.value });
    });
  };
}
