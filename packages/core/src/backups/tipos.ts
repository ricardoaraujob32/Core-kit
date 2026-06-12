// packages/core/src/backups/tipos.ts

import { LocatarioId } from "../locatarios/index.js";
import { UsuarioId } from "../usuarios/index.js";

/**
 * Identificador lógico de uma solicitação de backup.
 *
 * Observação arquitetural:
 * o esquema v16 direciona backup para a infraestrutura de `exportacoes`.
 * Este tipo tende a se tornar apenas um identificador de alto nível de orquestração.
 */
export type BackupId = string;

/**
 * Identificador lógico de uma solicitação de restauração.
 *
 * Observação arquitetural:
 * o esquema v16 direciona restauração para a infraestrutura de `importacoes`.
 */
export type RestauracaoId = string;

/**
 * Estado de execução de uma solicitação de backup.
 *
 * Este conjunto de estados é semanticamente equivalente ao status de jobs
 * assíncronos usados em exportações/importações e tende a convergir para um
 * contrato compartilhado de nível mais básico.
 */
export type StatusBackup =
  | "PENDENTE"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "FALHOU"
  | "CANCELADO";

/**
 * Estado de execução de uma solicitação de restauração.
 *
 * Este conjunto também é equivalente ao status de jobs assíncronos do sistema.
 */
export type StatusRestauracao =
  | "PENDENTE"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "FALHOU"
  | "CANCELADO";

/**
 * Projeção de domínio de um backup de locatário.
 *
 * Este tipo representa a visão de alto nível do módulo `backups`, mesmo
 * quando a persistência física for delegada à infraestrutura de exportações.
 */
export interface BackupLocatario {
  /** Identificador lógico da solicitação de backup. */
  backupId: BackupId;
  /** Locatário alvo do backup. */
  locatarioId: LocatarioId;
  /** Usuário que solicitou o backup. */
  solicitadoPorUsuarioId: UsuarioId;
  /** Formato lógico do artefato gerado. */
  formato: string;
  /** Estado atual da solicitação. */
  status: StatusBackup;
  /** Parâmetros adicionais da solicitação. */
  parametros: Record<string, unknown>;
  /** Referência para o artefato gerado, quando concluído. */
  referenciaResultado: string | null;
  /** Mensagem de erro, quando a operação falha. */
  mensagemErro: string | null;
  /** Data/hora de criação da solicitação. */
  criadoEm: Date;
  /** Data/hora da última atualização. */
  atualizadoEm: Date;
}

/**
 * Projeção de domínio de uma restauração de locatário.
 *
 * Assim como o backup, tende a ser orquestrada sobre `importacoes` no desenho v16.
 */
export interface RestauracaoLocatario {
  /** Identificador lógico da solicitação de restauração. */
  restauracaoId: RestauracaoId;
  /** Locatário alvo da restauração. */
  locatarioId: LocatarioId;
  /** Usuário que solicitou a restauração. */
  solicitadoPorUsuarioId: UsuarioId;
  /** Tipo de origem da restauração. */
  tipoOrigem: string;
  /** Referência da origem usada para restaurar. */
  referenciaOrigem: string | null;
  /** Estado atual da restauração. */
  status: StatusRestauracao;
  /** Parâmetros adicionais da restauração. */
  parametros: Record<string, unknown>;
  /** Estatísticas de processamento, quando houver. */
  estatisticas: Record<string, unknown>;
  /** Mensagem de erro, quando a operação falha. */
  mensagemErro: string | null;
  /** Data/hora de início do processamento. */
  iniciadoEm: Date | null;
  /** Data/hora de término do processamento. */
  finalizadoEm: Date | null;
  /** Data/hora de criação da solicitação. */
  criadoEm: Date;
  /** Data/hora da última atualização. */
  atualizadoEm: Date;
}

/**
 * Entrada para solicitar um backup lógico de locatário.
 */
export interface SolicitarBackupLocatarioInput {
  /** Locatário a ser exportado. */
  locatarioId: LocatarioId;
  /** Usuário que disparou a solicitação. */
  solicitadoPorUsuarioId: UsuarioId;
}

/**
 * Saída da solicitação de backup.
 */
export interface SolicitarBackupLocatarioOutput {
  /** Representação do backup solicitado. */
  backup: BackupLocatario;
}

/**
 * Entrada para listar backups de um locatário.
 */
export interface ListarBackupsLocatarioInput {
  /** Locatário cujos backups serão listados. */
  locatarioId: LocatarioId;
}

/**
 * Saída da listagem de backups de um locatário.
 */
export interface ListarBackupsLocatarioOutput {
  /** Locatário ao qual os backups pertencem. */
  locatarioId: LocatarioId;
  /** Coleção de backups retornados. */
  backups: BackupLocatario[];
}

/**
 * Entrada para solicitar restauração de locatário.
 */
export interface SolicitarRestauracaoLocatarioInput {
  /** Locatário que será restaurado. */
  locatarioId: LocatarioId;
  /** Backup de origem escolhido para restauração. */
  backupId: BackupId;
  /** Usuário que solicitou a restauração. */
  solicitadoPorUsuarioId: UsuarioId;
  /** Justificativa operacional da restauração. */
  motivo: string;
}

/**
 * Saída da solicitação de restauração.
 */
export interface SolicitarRestauracaoLocatarioOutput {
  /** Representação da restauração solicitada. */
  restauracao: RestauracaoLocatario;
}
