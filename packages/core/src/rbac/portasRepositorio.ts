// packages/core/src/rbac/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";
import { Papel, Permissao } from "./tipos";

/**
 * 
 */
export interface RbacRepositorio {
  listarPapeisDoUsuario(params: {locatarioId: LocatarioId; usuarioId: UsuarioId}): Promise<Result<Papel[], ErroApp>>;

  listarPermissoesEfetivasDoUsuario(params: {locatarioId: LocatarioId; usuarioId: UsuarioId}): Promise<Result<Permissao[], ErroApp>>;
}
