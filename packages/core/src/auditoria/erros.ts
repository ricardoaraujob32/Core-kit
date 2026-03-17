import type { ErroApp } from "../kernel/erros";
import type { Result } from "../kernel/result";
import { createErroApp, wrapErr } from "../kernel/ROPHelpers";

export function erroAuditoriaInvalida(
  detalhes?: Record<string, unknown>,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "AUDITORIA_INVALIDA",
      "Dados de auditoria são inválidos.",
      detalhes,
    ),
  );
}