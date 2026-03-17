import { wrapOk } from "../kernel/ROPHelpers";
import type { ErroApp } from "../kernel/erros";
import type { Result } from "../kernel/result";
import { validarIdGenerico, validarTextoObrigatorio } from "../utils";
import { erroBackupInvalido } from "./erros";
import type {
  ListarBackupsLocatarioInput,
  SolicitarBackupLocatarioInput,
  SolicitarRestauracaoLocatarioInput,
} from "./tipos";

function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return erroBackupInvalido({ campo, valor });
}

export function validarSolicitarBackupLocatarioInput(
  input: SolicitarBackupLocatarioInput,
): Result<SolicitarBackupLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  const solicitadoPorUsuarioId = mapearErro(
    validarIdGenerico(input.solicitadoPorUsuarioId, "solicitadoPorUsuarioId"),
    "solicitadoPorUsuarioId",
    input.solicitadoPorUsuarioId,
  );
  if (!solicitadoPorUsuarioId.ok) return solicitadoPorUsuarioId;

  return wrapOk(input);
}

export function validarListarBackupsLocatarioInput(
  input: ListarBackupsLocatarioInput,
): Result<ListarBackupsLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  return wrapOk(input);
}

export function validarSolicitarRestauracaoLocatarioInput(
  input: SolicitarRestauracaoLocatarioInput,
): Result<SolicitarRestauracaoLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"),
    "locatarioId",
    input.locatarioId,
  );
  if (!locatarioId.ok) return locatarioId;

  const backupId = mapearErro(
    validarIdGenerico(input.backupId, "backupId"),
    "backupId",
    input.backupId,
  );
  if (!backupId.ok) return backupId;

  const solicitadoPorUsuarioId = mapearErro(
    validarIdGenerico(input.solicitadoPorUsuarioId, "solicitadoPorUsuarioId"),
    "solicitadoPorUsuarioId",
    input.solicitadoPorUsuarioId,
  );
  if (!solicitadoPorUsuarioId.ok) return solicitadoPorUsuarioId;

  const motivo = mapearErro(
    validarTextoObrigatorio(input.motivo, "motivo", 1),
    "motivo",
    input.motivo,
  );
  if (!motivo.ok) return motivo;

  return wrapOk(input);
}
