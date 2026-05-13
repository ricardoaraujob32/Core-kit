// packages/core/src/auditoria/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";

export type CodigoErroAuditoria =
  | "AUDITORIA_INVALIDA"

/**
 * Cria erro para dados inválidos do domínio de auditoria.
 *
 * @param detalhes Metadados estruturados sobre a invalidez detectada.
 * @returns `Err(ErroApp)` específico do pacote `auditoria`.
 */
export function erroAuditoriaInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp({ codigo: "AUDITORIA_INVALIDA", mensagem: "Dados de auditoria são inválidos.", detalhes });
}
