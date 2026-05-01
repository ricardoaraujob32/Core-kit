import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import type { ClientesRepositorio } from "../portasRepositorio";
import type { ReativarClienteInput, ReativarClienteOutput, ReativarClienteResult } from "../tipos";
import { clienteNaoEncontrado } from "../erros";
import { validarClienteId, validarLocatarioId } from "../validadores";

export function createFnReativarCliente(deps: { clientesRepositorio: ClientesRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function reativarCliente(input: ReativarClienteInput): ReativarClienteResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const clienteId = validarClienteId(input.clienteId); if (!clienteId.ok) return clienteId;
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.clientesRepositorio.buscarPorId({ locatarioId: locatarioId.value, clienteId: clienteId.value });
      if (!atual.ok) return atual;
      if (!atual.value) return clienteNaoEncontrado(clienteId.value);
      const atualizado = await deps.clientesRepositorio.atualizar({ ...atual.value, status: "ATIVO", atualizadoEm: deps.relogio.agora() });
      if (!atualizado.ok) return atualizado;
      return wrapOk<ReativarClienteOutput>({ cliente: atualizado.value });
    });
  };
}
