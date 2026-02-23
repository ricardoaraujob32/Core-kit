import type { ErroApp } from "../erros";
import type { Result } from "../result";
import { createErroApp } from "../ROPHelpers";

export function erroEntradaInvalida<T = never>(mensagem: string, detalhes?: Record<string, unknown>): Result<T, ErroApp> {
  return createErroApp({ codigo: "INVALIDO", mensagem, detalhes });
}