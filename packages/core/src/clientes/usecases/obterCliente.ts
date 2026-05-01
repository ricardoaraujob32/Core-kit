import { wrapOk } from "../../kernel";
import type { ClientesRepositorio } from "../portasRepositorio";
import type { ObterClienteInput, ObterClienteOutput, ObterClienteResult } from "../tipos";
import { clienteNaoEncontrado } from "../erros";
import { validarClienteId, validarLocatarioId } from "../validadores";

export function createFnObterCliente(deps: { clientesRepositorio: ClientesRepositorio }) {
  return async function obterCliente(input: ObterClienteInput): ObterClienteResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const clienteId = validarClienteId(input.clienteId); if (!clienteId.ok) return clienteId;
    const res = await deps.clientesRepositorio.buscarPorId({ locatarioId: locatarioId.value, clienteId: clienteId.value });
    if (!res.ok) return res;
    if (!res.value) return clienteNaoEncontrado(clienteId.value);
    return wrapOk<ObterClienteOutput>({ cliente: res.value });
  };
}
