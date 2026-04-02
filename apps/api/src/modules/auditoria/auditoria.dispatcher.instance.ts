// apps/api/src/modules/auditoria/auditoria.dispatcher.instance.ts

import { createAuditoriaDispatcher } from "./auditoria.dispatcher";
import { tentarAuditarLocatario } from "./auditoriaLocatario.helpers";
import { tentarAuditarPlataforma } from "./auditoriaPlataforma.helpers";

/**
 * Dispatcher oficial de auditoria da API.
 *
 * Responsabilidades:
 * - aplicar a matriz canônica de eventos;
 * - rotear para `auditoria_plataforma`, `auditoria_locatario` ou ambas;
 * - tratar impersonação e `locatario_alvo_id`.
 */
export const auditar = createAuditoriaDispatcher({
  tentarAuditarPlataforma,
  tentarAuditarLocatario,
});
