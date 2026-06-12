import { wrapOk } from "../../kernel/index.js";
import type { FornecedoresRepositorio } from "../portasRepositorio.js";
import type { ListarFornecedorsInput, ListarFornecedorsOutput, ListarFornecedorsResult } from "../tipos.js";
import { validarLocatarioId } from "../validadores.js";

export function createFnListarFornecedores(deps: { fornecedoresRepositorio: FornecedoresRepositorio }) {
  return async function listarFornecedors(input: ListarFornecedorsInput): ListarFornecedorsResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const res = await deps.fornecedoresRepositorio.listarPorLocatario({ locatarioId: locatarioId.value, cursor: input.cursor, limite: input.limite });
    if (!res.ok) return res;
    return wrapOk<ListarFornecedorsOutput>({ itens: res.value });
  };
}
