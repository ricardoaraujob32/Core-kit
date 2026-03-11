import type { Result } from "../result";
import type { ErroApp } from "../erros";
import { wrapOk } from "../result";
import { permissaoInvalida } from "./erros";

export function validarPermissao(
  permissao: string
): Result<string, ErroApp> {
  if (typeof permissao !== "string" || permissao.trim().length === 0) {
    return permissaoInvalida(permissao);
  }

  return wrapOk(permissao.trim());
}