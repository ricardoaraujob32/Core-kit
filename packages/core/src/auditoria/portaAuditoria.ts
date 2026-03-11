// packages/core/src/auditoria/portaAuditoria.ts
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

export type EventoAuditoria = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId | null;
  acao: string;
  entidade: string;
  entidadeId?: string | null;
  dados?: Record<string, unknown>;
  criadoEm: Date;
};

export type AuditoriaWriter = {
  registrar(evento: EventoAuditoria): Promise<void>;
};
