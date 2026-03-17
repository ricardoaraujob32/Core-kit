// packages/core/src/locatarios/usecases/obterLocatario.ts

import type {ObterLocatarioInput, ResultadoObterLocatario} from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { validarLocatarioId } from "../validadores";
import {locatarioEncerrado, locatarioNaoEncontrado, locatarioSuspenso} from "../erros";
import { wrapOk } from "../../result";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createObterLocatario(deps: {locRepo: LocatariosRepositorio} ) {
  return async function obterLocatario(
    input: ObterLocatarioInput,
  ): ResultadoObterLocatario {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const res = await deps.locRepo.buscarPorId({
      locatarioId: locatarioId.value,
    });
    if (!res.ok) return res;

    const loc = res.value;
    if (!loc) return locatarioNaoEncontrado(locatarioId.value);

    if (loc.status === "SUSPENSO") {
      return locatarioSuspenso(loc.locatarioId);
    }

    if (loc.status === "ENCERRADO") {
      return locatarioEncerrado(loc.locatarioId);
    }

    return wrapOk(loc);
  };
}