// packages/core/src/importacoes/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel";
import { ImportacaoId, ItemImportacaoId } from "./tipos";


export type CodigoErroImportacao =
  | "IMPORTACAO_INVALIDA"
  | "IMPORTACAO_NAO_ENCONTRADA"
  | "ITEM_IMPORTACAO_NAO_ENCONTRADO"
  | "IMPORTACAO_TRANSICAO_STATUS_INVALIDA"

/**
 * Cria erro para dados inválidos de importação.
 *
 * Use este helper em validações de entrada, parâmetros de reprocessamento
 * ou montagem de comandos do módulo de importações.
 *
 * @param detalhes Metadados estruturados da invalidez detectada.
 * @returns `Err(ErroApp)` específico do pacote `importacoes`.
 */
export function erroImportacaoInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp({ codigo: "IMPORTACAO_INVALIDA", mensagem: "Dados da importação são inválidos.", detalhes });
}

/**
 * Cria erro para importação inexistente.
 *
 * @param importacaoId Identificador da importação não encontrada.
 * @returns `Err(ErroApp)` com contexto da busca.
 */
export function erroImportacaoNaoEncontrada(importacaoId: ImportacaoId): Result<never, ErroApp> {
  return createErroApp({ codigo: "IMPORTACAO_NAO_ENCONTRADA",mensagem: "Importação não encontrada.", detalhes: { importacaoId } });
}

/**
 * Cria erro para item de importação inexistente.
 *
 * @param itemImportacaoId Identificador do item não encontrado.
 * @returns `Err(ErroApp)` com contexto do item.
 */
export function erroItemImportacaoNaoEncontrado(itemImportacaoId: ItemImportacaoId): Result<never, ErroApp> {
  return createErroApp({ codigo: "ITEM_IMPORTACAO_NAO_ENCONTRADO", mensagem: "Item de importação não encontrado.", detalhes: { itemImportacaoId } });
}

/**
 * Cria erro para transição inválida de status em importações ou itens
 * relacionados ao fluxo de importação.
 *
 * @param entidade Nome lógico da entidade cujo status está sendo alterado.
 * @param id Identificador da entidade.
 * @param statusAtual Estado atual persistido.
 * @param statusDestino Estado solicitado.
 * @returns `Err(ErroApp)` específico de transição de status inválida.
 */
export function erroTransicaoStatusImportacaoInvalida(entidade: string, id: string, statusAtual: string, statusDestino: string): Result<never, ErroApp> {
  return createErroApp({ codigo: "IMPORTACAO_TRANSICAO_STATUS_INVALIDA", mensagem: "A transição de status da importação é inválida.", detalhes: { entidade, id, statusAtual, statusDestino } });
}
