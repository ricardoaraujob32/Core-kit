// packages/core/src/importacoes/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { Importacao, ImportacaoId, ItemImportacao, ItemImportacaoId, RegistrarImportacaoParams, RegistrarItemImportacaoParams
 } from "./tipos";

/**
 * Porta de persistência do agregado de importações.
 *
 * Esta interface abstrai criação, atualização, consulta e listagem de
 * importações no escopo do domínio.
 */
export interface ImportacoesRepositorio {
  /**
   * Cria uma nova importação persistida.
   *
   * @param params Dados estruturados de registro da importação.
   * @returns `Ok(importacao)` com a entidade criada.
   */
  criarImportacao(params: RegistrarImportacaoParams): Promise<Result<Importacao, ErroApp>>;

  /**
   * Atualiza integralmente a importação persistida.
   *
   * @param importacao Entidade de importação já validada pelo domínio.
   * @returns `Ok(importacaoAtualizada)` quando a persistência é bem-sucedida.
   */
  atualizarImportacao(importacao: Importacao): Promise<Result<Importacao, ErroApp>>;

  /**
   * Busca uma importação por identificador.
   *
   * @param importacaoId Identificador da importação.
   * @returns `Ok(importacao | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(importacaoId: ImportacaoId): Promise<Result<Importacao | null, ErroApp>>;

  /**
   * Lista importações pertencentes a um locatário.
   *
   * @param locatarioId Identificador do locatário consultado.
   * @returns `Ok` com a coleção de importações encontradas.
   */
  listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Importacao[], ErroApp>>;
}

/**
 * Porta de persistência dos itens de importação.
 *
 * Esta interface abstrai o armazenamento granular das unidades processadas
 * dentro de uma importação.
 */
export interface ItensImportacaoRepositorio {
  /**
   * Cria um novo item de importação.
   *
   * @param params Dados estruturados do item.
   * @returns `Ok(itemCriado)` quando a operação é bem-sucedida.
   */
  criarItem(params: RegistrarItemImportacaoParams): Promise<Result<ItemImportacao, ErroApp>>;

  /**
   * Atualiza integralmente um item de importação.
   *
   * @param item Item já validado pelo domínio.
   * @returns `Ok(itemAtualizado)` quando a persistência é bem-sucedida.
   */
  atualizarItem(item: ItemImportacao): Promise<Result<ItemImportacao, ErroApp>>;

  /**
   * Busca um item de importação por identificador.
   *
   * @param itemImportacaoId Identificador do item.
   * @returns `Ok(item | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(itemImportacaoId: ItemImportacaoId): Promise<Result<ItemImportacao | null, ErroApp>>;

  /**
   * Lista todos os itens pertencentes a uma importação no locatário informado.
   *
   * @param importacaoId Importação alvo da consulta.
   * @param locatarioId Locatário dono da importação.
   * @returns `Ok` com a coleção de itens encontrados.
   */
  listarPorImportacao(importacaoId: ImportacaoId, locatarioId: LocatarioId): Promise<Result<ItemImportacao[], ErroApp>>;
}
