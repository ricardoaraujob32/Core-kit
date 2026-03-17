import type { ErroApp } from "../kernel/erros";
import type { Result } from "../kernel/result";
import { createErroApp, wrapErr } from "../kernel/ROPHelpers";
import type { BackupId, LocatarioId } from "./tipos";

export function erroBackupInvalido(
  detalhes?: Record<string, unknown>,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "BACKUP_INVALIDO",
      "Dados de backup/restauração são inválidos.",
      detalhes,
    ),
  );
}

export function erroBackupNaoEncontrado(
  backupId: BackupId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "BACKUP_NAO_ENCONTRADO",
      "Backup não encontrado.",
      { backupId },
    ),
  );
}

export function erroBackupNaoPertenceAoLocatario(
  backupId: BackupId,
  locatarioId: LocatarioId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "BACKUP_NAO_PERTENCE_AO_LOCATARIO",
      "O backup informado não pertence ao locatário.",
      { backupId, locatarioId },
    ),
  );
}

export function erroBackupNaoDisponivelParaRestauracao(
  backupId: BackupId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "BACKUP_NAO_DISPONIVEL_PARA_RESTAURACAO",
      "O backup não está disponível para restauração.",
      { backupId },
    ),
  );
}

export function erroJaExisteBackupEmAberto(
  locatarioId: LocatarioId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "BACKUP_EM_ABERTO_JA_EXISTE",
      "Já existe um backup em aberto para este locatário.",
      { locatarioId },
    ),
  );
}

export function erroJaExisteRestauracaoEmAberto(
  locatarioId: LocatarioId,
): Result<never, ErroApp> {
  return wrapErr(
    createErroApp(
      "RESTAURACAO_EM_ABERTO_JA_EXISTE",
      "Já existe uma restauração em aberto para este locatário.",
      { locatarioId },
    ),
  );
}