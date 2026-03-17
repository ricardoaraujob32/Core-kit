// packages/core/src/rbac/validadores.ts

import type { Result } from "../result";
import type { ErroApp } from "../erros";
import { permissaoInvalida } from "./erros";
import { validarTextoObrigatorio } from "../utils";
import { Permissao } from "./tipos";

export function validarPermissao(permissao: Permissao): Result<string, ErroApp> {
  const res = validarTextoObrigatorio(permissao, "permissao", 1);
  if (res.ok) return res;

  return permissaoInvalida(permissao);
}