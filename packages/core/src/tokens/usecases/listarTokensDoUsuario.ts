// packages/core/src/tokens/usecases/listarTokensDoUsuario.ts

import { wrapOk } from "../../result";
import type { ListarTokensDoUsuarioInput, ListarTokensDoUsuarioOutput, ResultadoListarTokensDoUsuario } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarUsuarioId } from "../../usuarios";
import { validarLocatarioId } from "../../locatarios";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createListarTokensDoUsuario(deps: {
  tokensRepo: TokensRepositorio;
}) {
  return async function listarTokensDoUsuario(input: ListarTokensDoUsuarioInput): ResultadoListarTokensDoUsuario {
    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const res = await deps.tokensRepo.listarPorUsuario({
      usuarioId: usuarioId.value,
      locatarioId: locatarioId.value,
    });
    if (!res.ok) return res;

    return wrapOk<ListarTokensDoUsuarioOutput>({
      itens: res.value,
    });
  };
}