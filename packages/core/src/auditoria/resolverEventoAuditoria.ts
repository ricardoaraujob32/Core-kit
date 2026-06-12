// packages/core/src/auditoria/resolverEventoAuditoria.ts

import type { EventoAuditoriaDef } from "./eventos.js";
import { EVENTOS_AUDITORIA } from "./eventos.js";

/**
 * Resolve a definição canônica de um evento de auditoria.
 *
 * @param nome Nome do evento.
 * @returns Definição encontrada.
 * @throws Error quando o evento não estiver mapeado.
 */
export function resolverEventoAuditoria(nome: string): EventoAuditoriaDef {
  const evento = EVENTOS_AUDITORIA.find((item) => item.evento === nome);

  if (!evento) {
    throw new Error(`Evento de auditoria não mapeado: ${nome}`);
  }

  return evento;
}
