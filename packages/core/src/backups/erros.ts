// packages/core/src/backups/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { BackupId } from "./tipos";

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function erroBackupInvalido(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp("BACKUP_INVALIDO", "Dados de backup/restauração são inválidos.", detalhes);
}

/**
 * 
 * @param backupId 
 * @returns 
 */
export function erroBackupNaoEncontrado(backupId: BackupId): Result<never, ErroApp> {
  return createErroApp("BACKUP_NAO_ENCONTRADO", "Backup não encontrado.", { backupId });
}

/**
 * 
 * @param backupId 
 * @param locatarioId 
 * @returns 
 */
export function erroBackupNaoPertenceAoLocatario(backupId: BackupId, locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp("BACKUP_NAO_PERTENCE_AO_LOCATARIO","O backup informado não pertence ao locatário.",{ backupId, locatarioId });
}

/**
 * 
 * @param backupId 
 * @returns 
 */
export function erroBackupNaoDisponivelParaRestauracao(backupId: BackupId): Result<never, ErroApp> {
  return createErroApp("BACKUP_NAO_DISPONIVEL_PARA_RESTAURACAO","O backup não está disponível para restauração.",{ backupId });
}

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function erroJaExisteBackupEmAberto(locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp("BACKUP_EM_ABERTO_JA_EXISTE","Já existe um backup em aberto para este locatário.",{ locatarioId });
}

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function erroJaExisteRestauracaoEmAberto(locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp("RESTAURACAO_EM_ABERTO_JA_EXISTE","Já existe uma restauração em aberto para este locatário.",{ locatarioId });
}
