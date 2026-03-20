// packages/core/src/locatarios/usecases/listarLocatarios.ts

import type {ListarLocatariosOutput, ResultadoListarLocatarios} from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { wrapOk } from "../../kernel";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnListarLocatarios(deps: {locRepo: LocatariosRepositorio} ) {
  return async function listarLocatarios(): ResultadoListarLocatarios {
    const res = await deps.locRepo.listar();
    if (!res.ok) return res;

    return wrapOk<ListarLocatariosOutput>({
      itens: res.value,
    });
  };
}
