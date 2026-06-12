import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel/index.js";
import type { ClientesRepositorio } from "../portasRepositorio.js";
import type { InativarClienteInput, InativarClienteOutput, InativarClienteResult } from "../tipos.js";
import { clienteNaoEncontrado } from "../erros.js";
import { validarClienteId, validarLocatarioId } from "../validadores.js";

export function createFnInativarCliente(deps: { clientesRepositorio: ClientesRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function inativarCliente(input: InativarClienteInput): InativarClienteResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const clienteId = validarClienteId(input.clienteId); if (!clienteId.ok) return clienteId;
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.clientesRepositorio.buscarPorId({ locatarioId: locatarioId.value, clienteId: clienteId.value });
      if (!atual.ok) return atual;
      if (!atual.value) return clienteNaoEncontrado(clienteId.value);
      const atualizado = await deps.clientesRepositorio.atualizar({ ...atual.value, status: "INATIVO", atualizadoEm: deps.relogio.agora() });
      if (!atualizado.ok) return atualizado;
      return wrapOk<InativarClienteOutput>({ cliente: atualizado.value });
    });
  };
}
