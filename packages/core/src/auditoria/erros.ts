// packages/core/src/auditoria/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function erroAuditoriaInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp("AUDITORIA_INVALIDA","Dados de auditoria são inválidos.", detalhes);
}
