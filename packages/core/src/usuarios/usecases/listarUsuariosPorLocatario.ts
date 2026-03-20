// packages/core/src/usuarios/usecases/listarUsuariosPorLocatario.ts

import { wrapOk } from "../../kernel";
import type { ListarUsuariosPorLocatarioInput, ListarUsuariosPorLocatarioOutput, ResultadoListarUsuariosPorLocatario } from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import { validarLocatarioId } from "../../locatarios";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnListarUsuariosPorLocatario(deps: {
  usuariosRepo: UsuariosRepositorio;
}) {
  return async function listarUsuariosPorLocatario(input: ListarUsuariosPorLocatarioInput): ResultadoListarUsuariosPorLocatario {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const res = await deps.usuariosRepo.listarPorLocatario({
      locatarioId: locatarioId.value,
    });
    if (!res.ok) return res;

    return wrapOk<ListarUsuariosPorLocatarioOutput>({
      itens: res.value,
    });
  };
}