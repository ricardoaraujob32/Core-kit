// packages/core/src/exportacoes/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel/index.js";
import { ExportacaoId } from "./tipos.js";

export type CodigoErroExportacao =
  | "EXPORTACAO_INVALIDA"
  | "EXPORTACAO_NAO_ENCONTRADA"
  | "EXPORTACAO_TRANSICAO_STATUS_INVALIDA"

/**
 * Cria erro para dados inválidos de exportação.
 *
 * @param detalhes Metadados estruturados sobre a invalidez detectada.
 * @returns `Err(ErroApp)` específico do pacote `exportacoes`.
 */
export function erroExportacaoInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp({ codigo: "EXPORTACAO_INVALIDA", mensagem: "Dados da exportação são inválidos.", detalhes });
}

/**
 * Cria erro para exportação inexistente.
 *
 * @param exportacaoId Identificador da exportação não encontrada.
 * @returns `Err(ErroApp)` com contexto da consulta.
 */
export function erroExportacaoNaoEncontrada(exportacaoId: ExportacaoId): Result<never, ErroApp> {
  return createErroApp({ codigo: "EXPORTACAO_NAO_ENCONTRADA", mensagem: "Exportação não encontrada.", detalhes: { exportacaoId } });
}

/**
 * Cria erro para transição inválida de status de exportação.
 *
 * @param exportacaoId Identificador da exportação.
 * @param statusAtual Estado atual persistido.
 * @param statusDestino Estado solicitado.
 * @returns `Err(ErroApp)` específico de transição de status inválida.
 */
export function erroTransicaoStatusExportacaoInvalida(exportacaoId: ExportacaoId, statusAtual: string, statusDestino: string): Result<never, ErroApp> {
  return createErroApp({ codigo: "EXPORTACAO_TRANSICAO_STATUS_INVALIDA", mensagem: "A transição de status da exportação é inválida.", detalhes: { exportacaoId, statusAtual, statusDestino } });
}
