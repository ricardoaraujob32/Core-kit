// packages/core/src/clientes/usecases/excluirCliente.ts

import type { ClientesRepositorio } from "../portasRepositorio";
import type { ExcluirClienteInput, ExcluirClienteOutput, ExcluirClienteResult } from "../tipos";
import { validarClienteId, validarLocatarioId } from "../validadores";
import { clienteNaoEncontrado } from "../erros";
import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnExcluirCliente(deps: {
  clientesRepositorio: ClientesRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   */
  return async function excluirCliente(input: ExcluirClienteInput): ExcluirClienteResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const clienteId = validarClienteId(input.clienteId);
    if (!clienteId.ok) return clienteId;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.clientesRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
        clienteId: clienteId.value,
      });
      if (!atual.ok) return atual;
      if (!atual.value) return clienteNaoEncontrado(clienteId.value);

      const agora = deps.relogio.agora();

      const atualizado = await deps.clientesRepositorio.atualizar({
        ...atual.value,
        excluidoEm: agora,
        excluidoPor: input.excluidoPor ?? null,
        excluidoMotivo: input.excluidoMotivo?.trim() || null,
        atualizadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<ExcluirClienteOutput>({
        cliente: atualizado.value,
      });
    });
  };
}