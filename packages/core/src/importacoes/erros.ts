// packages/core/src/importacoes/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";
import { ImportacaoId, ItemImportacaoId } from "./tipos";

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function erroImportacaoInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp("IMPORTACAO_INVALIDA", "Dados da importação são inválidos.", detalhes);
}

/**
 * 
 * @param importacaoId 
 * @returns 
 */
export function erroImportacaoNaoEncontrada(importacaoId: ImportacaoId): Result<never, ErroApp> {
  return createErroApp("IMPORTACAO_NAO_ENCONTRADA", "Importação não encontrada.", { importacaoId });
}

/**
 * 
 * @param itemImportacaoId 
 * @returns 
 */
export function erroItemImportacaoNaoEncontrado(itemImportacaoId: ItemImportacaoId): Result<never, ErroApp> {
  return createErroApp("ITEM_IMPORTACAO_NAO_ENCONTRADO", "Item de importação não encontrado.", { itemImportacaoId });
}

/**
 * 
 * @param entidade 
 * @param id 
 * @param statusAtual 
 * @param statusDestino 
 * @returns 
 */
export function erroTransicaoStatusImportacaoInvalida(entidade: string, id: string, statusAtual: string, statusDestino: string): Result<never, ErroApp> {
  return createErroApp("IMPORTACAO_TRANSICAO_STATUS_INVALIDA", "A transição de status é inválida.",
      { entidade, id, statusAtual, statusDestino } );
}
