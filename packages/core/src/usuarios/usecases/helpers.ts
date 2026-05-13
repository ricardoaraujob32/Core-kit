// packages/core/src/usuarios/usecases/helpers.ts

import { wrapOk } from "../../kernel";
import { validarLocatarioId } from "../../locatarios";
import { usuarioNaoEncontrado } from "../erros";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { UsuarioId } from "../tipos";
import { validarUsuarioId } from "../validadores";

/**
 * 
 * @param params 
 * @returns 
 */
export async function obterUsuarioObrigatorio(params: {
  usuariosRepositorio: UsuariosRepositorio;
  locatarioId: string;
  usuarioId: UsuarioId;
}) {
  const locatarioId = validarLocatarioId(params.locatarioId);
  if (!locatarioId.ok) return locatarioId;

  const usuarioId = validarUsuarioId(params.usuarioId);
  if (!usuarioId.ok) return usuarioId;

  const resultado = await params.usuariosRepositorio.buscarPorId({
    locatarioId: locatarioId.value,
    usuarioId: usuarioId.value,
  });
  if (!resultado.ok) return resultado;

  if (!resultado.value || resultado.value.excluidoEm) {
    return usuarioNaoEncontrado(usuarioId.value);
  }

  return wrapOk(resultado.value);
}