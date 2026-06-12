// packages/core/src/usuarios/usecases/helpers.ts

import { wrapOk } from "../../kernel/index.js";
import { validarLocatarioId } from "../../locatarios/index.js";
import { usuarioNaoEncontrado } from "../erros.js";
import type { UsuariosRepositorio } from "../portasRepositorio.js";
import type { UsuarioId } from "../tipos.js";
import { validarUsuarioId } from "../validadores.js";

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