import { wrapOk } from "../../kernel";
import type { ClientesRepositorio } from "../portasRepositorio";
import type { ListarClientesInput, ListarClientesOutput, ListarClientesResult } from "../tipos";
import { validarLocatarioId } from "../validadores";

export function createFnListarClientes(deps: { clientesRepositorio: ClientesRepositorio }) {
  return async function listarClientes(input: ListarClientesInput): ListarClientesResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const res = await deps.clientesRepositorio.listarPorLocatario({ locatarioId: locatarioId.value, cursor: input.cursor, limite: input.limite });
    if (!res.ok) return res;
    return wrapOk<ListarClientesOutput>({ itens: res.value });
  };
}
