// packages/core/src/backups/tipos.ts

import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

/**
 * 
 */
export type BackupId = string;

/**
 * 
 */
export type RestauracaoId = string;

/**
 * 
 */
export type StatusBackup =
  | "PENDENTE"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "FALHOU"
  | "CANCELADO";

  /**
   * 
   */
export type StatusRestauracao =
  | "PENDENTE"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "FALHOU"
  | "CANCELADO";

/**
 * 
 */  
export interface BackupLocatario {
  backupId: BackupId;
  locatarioId: LocatarioId;
  solicitadoPorUsuarioId: UsuarioId;
  formato: string;
  status: StatusBackup;
  parametros: Record<string, unknown>;
  referenciaResultado: string | null;
  mensagemErro: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * 
 */
export interface RestauracaoLocatario {
  restauracaoId: RestauracaoId;
  locatarioId: LocatarioId;
  solicitadoPorUsuarioId: UsuarioId;
  tipoOrigem: string;
  referenciaOrigem: string | null;
  status: StatusRestauracao;
  parametros: Record<string, unknown>;
  estatisticas: Record<string, unknown>;
  mensagemErro: string | null;
  iniciadoEm: Date | null;
  finalizadoEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * 
 */
export interface SolicitarBackupLocatarioInput {
  locatarioId: LocatarioId;
  solicitadoPorUsuarioId: UsuarioId;
}

/**
 * 
 */
export interface SolicitarBackupLocatarioOutput {
  backup: BackupLocatario;
}

/**
 * 
 */
export interface ListarBackupsLocatarioInput {
  locatarioId: LocatarioId;
}

/**
 * 
 */
export interface ListarBackupsLocatarioOutput {
  locatarioId: LocatarioId;
  backups: BackupLocatario[];
}

/**
 * 
 */
export interface SolicitarRestauracaoLocatarioInput {
  locatarioId: LocatarioId;
  backupId: BackupId;
  solicitadoPorUsuarioId: UsuarioId;
  motivo: string;
}

/**
 * 
 */
export interface SolicitarRestauracaoLocatarioOutput {
  restauracao: RestauracaoLocatario;
}
