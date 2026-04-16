// packages/core/src/locatarios/usecases/suspenderLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, TransacaoPorta } from "../../kernel";
import type { SuspenderLocatarioInput } from "../tipos";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { validarLocatarioId } from "../validadores";
import { locatarioNaoEncontrado } from "../erros";
import { transicionarEstadoLocatario } from "../maquinaEstados";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnSuspenderLocatario(deps: {
  locatarioRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   * @param input
   * @returns
   */
  return async function suspenderLocatario(input: SuspenderLocatarioInput) {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.locatarioRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
      });
      if (!atual.ok) return atual;
      if (!atual.value) return locatarioNaoEncontrado(locatarioId.value);

      const transicao = transicionarEstadoLocatario({
        locatarioId: atual.value.locatarioId,
        statusAtual: atual.value.status,
        evento: "SUSPENDER",
      });
      if (!transicao.ok) return transicao;

      const agora = deps.relogio.agora();

      const atualizado = await deps.locatarioRepositorio.atualizar({
        ...atual.value,
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
