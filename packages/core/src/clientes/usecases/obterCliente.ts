import { wrapOk } from "../../kernel/index.js";
import type { ClientesRepositorio } from "../portasRepositorio.js";
import type { ObterClienteInput, ObterClienteOutput, ObterClienteResult } from "../tipos.js";
import { clienteNaoEncontrado } from "../erros.js";
import { validarClienteId, validarLocatarioId } from "../validadores.js";

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
