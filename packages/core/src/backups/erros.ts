// packages/core/src/backups/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { BackupId } from "./tipos";

export type CodigoErroBackup =
  | "BACKUP_INVALIDO"
  | "BACKUP_NAO_ENCONTRADO"
  | "BACKUP_NAO_PERTENCE_AO_LOCATARIO"
  | "BACKUP_NAO_DISPONIVEL_PARA_RESTAURACAO"
  | "BACKUP_EM_ABERTO_JA_EXISTE"
  | "RESTAURACAO_EM_ABERTO_JA_EXISTE";

/**
 * Cria erro para dados inválidos de backup ou restauração.
 *
 * Apesar de o módulo tender a atuar como orquestrador sobre exportações e
 * importações, ele ainda pode expor invariantes próprias de alto nível.
 *
 * @param detalhes Metadados estruturados sobre a invalidez detectada.
 * @returns `Err(ErroApp)` específico do pacote `backups`.
 */
export function erroBackupInvalido(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp({ codigo: "BACKUP_INVALIDO", mensagem: "Dados de backup ou restauração são inválidos.", detalhes });
}

/**
 * Cria erro para backup inexistente.
 *
 * @param backupId Identificador do backup não encontrado.
 * @returns `Err(ErroApp)` com contexto da busca.
 */
export function erroBackupNaoEncontrado(backupId: BackupId): Result<never, ErroApp> {
  return createErroApp({ codigo: "BACKUP_NAO_ENCONTRADO", mensagem: "Backup não encontrado.", detalhes: { backupId } });
}

/**
 * Cria erro quando o backup informado não pertence ao locatário esperado.
 *
 * @param backupId Identificador do backup consultado.
 * @param locatarioId Locatário esperado para a operação.
 * @returns `Err(ErroApp)` específico de isolamento multi-tenant.
 */
export function erroBackupNaoPertenceAoLocatario(backupId: BackupId, locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp({ codigo: "BACKUP_NAO_PERTENCE_AO_LOCATARIO", mensagem: "O backup informado não pertence ao locatário.", detalhes: { backupId, locatarioId } });
}

/**
 * Cria erro quando o backup existe, mas não pode ser usado para restauração.
 *
 * @param backupId Identificador do backup rejeitado.
 * @returns `Err(ErroApp)` específico de elegibilidade de restauração.
 */
export function erroBackupNaoDisponivelParaRestauracao(backupId: BackupId): Result<never, ErroApp> {
  return createErroApp({ codigo: "BACKUP_NAO_DISPONIVEL_PARA_RESTAURACAO", mensagem: "O backup não está disponível para restauração.", detalhes: { backupId } });
}

/**
 * Cria erro de conflito para backup em aberto já existente no locatário.
 *
 * @param locatarioId Locatário em que o conflito foi detectado.
 * @returns `Err(ErroApp)` específico de concorrência operacional.
 */
export function erroJaExisteBackupEmAberto(locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp({ codigo: "BACKUP_EM_ABERTO_JA_EXISTE", mensagem: "Já existe um backup em aberto para este locatário.", detalhes: { locatarioId } });
}

/**
 * Cria erro de conflito para restauração em aberto já existente no locatário.
 *
 * @param locatarioId Locatário em que o conflito foi detectado.
 * @returns `Err(ErroApp)` específico de concorrência operacional.
 */
export function erroJaExisteRestauracaoEmAberto(locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp({ codigo: "RESTAURACAO_EM_ABERTO_JA_EXISTE", mensagem: "Já existe uma restauração em aberto para este locatário.", detalhes: { locatarioId } });
}
