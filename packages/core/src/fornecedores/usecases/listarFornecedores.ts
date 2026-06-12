import { wrapOk } from "../../kernel";
import type { FornecedoresRepositorio } from "../portasRepositorio";
import type { ListarFornecedorsInput, ListarFornecedorsOutput, ListarFornecedorsResult } from "../tipos";
import { validarLocatarioId } from "../validadores";

export function createFnListarFornecedores(deps: { fornecedoresRepositorio: FornecedoresRepositorio }) {
  return async function listarFornecedors(input: ListarFornecedorsInput): ListarFornecedorsResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const res = await deps.fornecedoresRepositorio.listarPorLocatario({ locatarioId: locatarioId.value, cursor: input.cursor, limite: input.limite });
    if (!res.ok) return res;
    return wrapOk<ListarFornecedorsOutput>({ itens: res.value });
  };
}
