// packages/core/src/importacoes/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { Importacao, ImportacaoId, ItemImportacao, ItemImportacaoId, RegistrarImportacaoParams, RegistrarItemImportacaoParams
 } from "./tipos";


/**
 * 
 */
export interface ImportacoesRepositorio {
  criarImportacao(params: RegistrarImportacaoParams): Promise<Result<Importacao, ErroApp>>;

  atualizarImportacao(importacao: Importacao): Promise<Result<Importacao, ErroApp>>;

  buscarPorId(importacaoId: ImportacaoId): Promise<Result<Importacao | null, ErroApp>>;

  listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Importacao[], ErroApp>>;
}

/**
 * 
 */
export interface ItensImportacaoRepositorio {
  criarItem(params: RegistrarItemImportacaoParams): Promise<Result<ItemImportacao, ErroApp>>;

  atualizarItem(item: ItemImportacao): Promise<Result<ItemImportacao, ErroApp>>;

  buscarPorId(itemImportacaoId: ItemImportacaoId): Promise<Result<ItemImportacao | null, ErroApp>>;

  listarPorImportacao(importacaoId: ImportacaoId, locatarioId: LocatarioId): Promise<Result<ItemImportacao[], ErroApp>>;
}
