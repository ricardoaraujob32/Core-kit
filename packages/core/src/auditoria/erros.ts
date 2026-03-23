// packages/core/src/auditoria/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";

/**
 * Cria erro para dados inválidos do domínio de auditoria.
 *
 * Use este helper quando o evento, os metadados, o escopo ou os parâmetros
 * de registro/consulta não atenderem aos requisitos mínimos do módulo.
 *
 * @param detalhes Metadados estruturados sobre a invalidez detectada.
 * @returns `Err(ErroApp)` específico do pacote `auditoria`.
 */
export function erroAuditoriaInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp({ codigo: "AUDITORIA_INVALIDA", detalhes });
}
