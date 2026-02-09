// packages/core/src/auditoria/portaAuditoria.ts
import type { IdLocatario, IdUsuario } from "../contextoExecucao";

export type EventoAuditoria = {
  locatarioId: IdLocatario;
  usuarioId: IdUsuario | null;
  acao: string;
  entidade: string;
  entidadeId?: string | null;
  dados?: Record<string, unknown>;
  criadoEm: Date;
};

export type AuditoriaWriter = {
  registrar(evento: EventoAuditoria): Promise<void>;
};
