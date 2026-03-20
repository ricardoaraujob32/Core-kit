// packages/core/src/rbac/validadores.ts

import { ErroApp, Result, validarTextoObrigatorio } from "../kernel";
import { permissaoInvalida } from "./erros";
import { Permissao } from "./tipos";

/**
 * 
 * @param permissao 
 * @returns 
 */
export function validarPermissao(permissao: Permissao): Result<string, ErroApp> {
  const res = validarTextoObrigatorio(permissao, "permissao", 1);
  if (res.ok) return res;

  return permissaoInvalida(permissao);
}
