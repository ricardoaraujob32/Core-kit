// packages/core/src/backups/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio, wrapOk } from "../kernel";
import { erroBackupInvalido } from "./erros";
import { ListarBackupsLocatarioInput, SolicitarBackupLocatarioInput, SolicitarRestauracaoLocatarioInput } from "./tipos";

/**
 * Converte falhas dos validadores transversais em erro específico
 * do domínio de backups/restaurações.
 *
 * @param resultado Resultado da validação compartilhada.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor rejeitado.
 * @returns `Ok` original ou `Err` específico do módulo `backups`.
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return erroBackupInvalido({ campo, valor });
}

/**
 * Valida a entrada de solicitação de backup de locatário.
 *
 * Regras atuais:
 * - `locatarioId` válido;
 * - `solicitadoPorUsuarioId` válido.
 *
 * @param input Entrada recebida para solicitar o backup.
 * @returns `Ok(input)` quando a estrutura mínima é válida.
 */
export function validarSolicitarBackupLocatarioInput(input: SolicitarBackupLocatarioInput): Result<SolicitarBackupLocatarioInput, ErroApp> {
  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  const solicitadoPorUsuarioId = mapearErro( validarIdGenerico(input.solicitadoPorUsuarioId, "solicitadoPorUsuarioId"),
    "solicitadoPorUsuarioId", input.solicitadoPorUsuarioId );
  if (!solicitadoPorUsuarioId.ok) return solicitadoPorUsuarioId;

  return wrapOk(input);
}

/**
 * Valida a entrada de listagem de backups de um locatário.
 *
 * @param input Filtro recebido para a operação.
 * @returns `Ok(input)` quando o locatário é válido.
 */
export function validarListarBackupsLocatarioInput(input: ListarBackupsLocatarioInput): Result<ListarBackupsLocatarioInput, ErroApp> {
  const locatarioId = mapearErro( validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  return wrapOk(input);
}

/**
 * Valida a entrada de solicitação de restauração de locatário.
 *
 * Regras atuais:
 * - `locatarioId` válido;
 * - `backupId` válido;
 * - `solicitadoPorUsuarioId` válido;
 * - `motivo` obrigatório.
 *
 * @param input Entrada recebida para solicitar a restauração.
 * @returns `Ok(input)` quando os campos obrigatórios são válidos.
 */
export function validarSolicitarRestauracaoLocatarioInput(input: SolicitarRestauracaoLocatarioInput): Result<SolicitarRestauracaoLocatarioInput, ErroApp> {
  const locatarioId = mapearErro(
    validarIdGenerico(input.locatarioId, "locatarioId"), "locatarioId", input.locatarioId );
  if (!locatarioId.ok) return locatarioId;

  const backupId = mapearErro( validarIdGenerico(input.backupId, "backupId"), "backupId", input.backupId );
  if (!backupId.ok) return backupId;

  const solicitadoPorUsuarioId = mapearErro( validarIdGenerico(input.solicitadoPorUsuarioId, "solicitadoPorUsuarioId"),
    "solicitadoPorUsuarioId", input.solicitadoPorUsuarioId );
  if (!solicitadoPorUsuarioId.ok) return solicitadoPorUsuarioId;

  const motivo = mapearErro( validarTextoObrigatorio(input.motivo, "motivo", 1), "motivo", input.motivo );
  if (!motivo.ok) return motivo;

  return wrapOk(input);
}
