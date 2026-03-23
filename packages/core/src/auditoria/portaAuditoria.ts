// packages/core/src/auditoria/portaAuditoria.ts

import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

/**
 * Evento mínimo de auditoria emitido pelo domínio.
 *
 * Este tipo representa um rastro estruturado de ação de negócio,
 * independente da tecnologia concreta de armazenamento ou entrega.
 */
export type EventoAuditoria = {
  /** Locatário ao qual o evento pertence. */
  locatarioId: LocatarioId;
  /** Usuário responsável pela ação, quando identificado. */
  usuarioId: UsuarioId | null;
  /** Ação lógica registrada na trilha de auditoria. */
  acao: string;
  /** Entidade principal afetada pela ação. */
  entidade: string;
  /** Identificador da entidade afetada, quando houver. */
  entidadeId?: string | null;
  /** Metadados estruturados adicionais do evento. */
  dados?: Record<string, unknown>;
  /** Instante de criação do evento. */
  criadoEm: Date;
};

/**
 * Porta de escrita de auditoria.
 *
 * Diferentemente de um repositório de domínio principal, esta interface
 * representa a capacidade de registrar rastros de operação para fins de
 * observabilidade, trilha histórica e compliance.
 */
export type AuditoriaWriter = {
  /**
   * Registra um evento de auditoria.
   *
   * @param evento Evento estruturado a ser persistido ou encaminhado.
   * @returns `Promise<void>` porque a auditoria pode ser tratada como side effect.
   */
  registrar(evento: EventoAuditoria): Promise<void>;
};
