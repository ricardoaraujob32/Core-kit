// packages/core/src/exportacoes/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";
import { ExportacaoId } from "./tipos";

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function erroExportacaoInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp("EXPORTACAO_INVALIDA", "Dados da exportação são inválidos.", detalhes);
}

/**
 * 
 * @param exportacaoId 
 * @returns 
 */
export function erroExportacaoNaoEncontrada(exportacaoId: ExportacaoId): Result<never, ErroApp> {
  return createErroApp("EXPORTACAO_NAO_ENCONTRADA", "Exportação não encontrada.", {exportacaoId});
}

/**
 * 
 * @param exportacaoId 
 * @param statusAtual 
 * @param statusDestino 
 * @returns 
 */
export function erroTransicaoStatusExportacaoInvalida(exportacaoId: ExportacaoId, statusAtual: string, statusDestino: string): Result<never, ErroApp> {
  return createErroApp("EXPORTACAO_TRANSICAO_STATUS_INVALIDA", "A transição de status da exportação é inválida.",
      { exportacaoId, statusAtual, statusDestino });
}
