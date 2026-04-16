// packages/core/src/locatarios/usecases/encerrarLocatario.ts

import type { LocatariosRepositorio } from "../portasRepositorio";
import type { RelogioPorta, TransacaoPorta } from "../../kernel";
import { executarEmTransacao, wrapOk } from "../../kernel";
import { validarLocatarioId } from "../validadores";
import { locatarioNaoEncontrado } from "../erros";
import { transicionarEstadoLocatario } from "../maquinaEstados";
import { EncerrarLocatarioInput } from "../tipos";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnEncerrarLocatario(deps: {
  locatarioRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   * @param input
   * @returns
   */
  return async function encerrarLocatario(input: EncerrarLocatarioInput) {
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
        evento: "ENCERRAR",
      });
      if (!transicao.ok) return transicao;

      const agora = deps.relogio.agora();

      const atualizado = await deps.locatarioRepositorio.atualizar({
        ...atual.value,
        status: transicao.value,
        excluidoEm: agora,
        motivoExclusao: input.motivoExclusao?.trim() || null,
        atualizadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk({
        locatario: atualizado.value,
      });
    });
  };
}
