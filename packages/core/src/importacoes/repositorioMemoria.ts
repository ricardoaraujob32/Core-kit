// packages/core/src/importacoes/repositorioMemoria.ts

import { randomUUID } from "node:crypto";
import { ErroApp, Result, wrapOk } from "../kernel";
import { ImportacoesRepositorio, ItensImportacaoRepositorio } from "./portasRepositorio";
import { Importacao, ImportacaoId, ItemImportacao, ItemImportacaoId, RegistrarImportacaoParams, RegistrarItemImportacaoParams 
} from "./tipos";
import { LocatarioId } from "../locatarios";

/**
 * 
 */
export class ImportacoesRepositorioMemoria implements ImportacoesRepositorio {
  private readonly itens = new Map<ImportacaoId, Importacao>();

  async criarImportacao(params: RegistrarImportacaoParams): Promise<Result<Importacao, ErroApp>> {
    const item: Importacao = {
      importacaoId: params.importacaoId ?? randomUUID(),
      locatarioId: params.locatarioId,
      criadoPorUsuarioId: params.criadoPorUsuarioId ?? null,
      tipoOrigem: params.tipoOrigem,
      referenciaOrigem: params.referenciaOrigem ?? null,
      status: params.status,
      mapeamentoColunas: params.mapeamentoColunas,
      estatisticas: params.estatisticas,
      mensagemErro: params.mensagemErro ?? null,
      iniciadoEm: params.iniciadoEm ?? null,
      finalizadoEm: params.finalizadoEm ?? null,
      criadoEm: params.criadoEm,
      atualizadoEm: params.atualizadoEm,
    };

    this.itens.set(item.importacaoId, item);
    return wrapOk(item);
  }

  async atualizarImportacao(importacao: Importacao): Promise<Result<Importacao, ErroApp>> {
    this.itens.set(importacao.importacaoId, importacao);
    return wrapOk(importacao);
  }

  async buscarPorId(importacaoId: ImportacaoId): Promise<Result<Importacao | null, ErroApp>> {
    return wrapOk(this.itens.get(importacaoId) ?? null);
  }

  async listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Importacao[], ErroApp>> {
    return wrapOk(
      [...this.itens.values()]
        .filter((item) => item.locatarioId === locatarioId)
        .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()),
    );
  }
}

/**
 * 
 */
export class ItensImportacaoRepositorioMemoria implements ItensImportacaoRepositorio
{
  private readonly itens = new Map<ItemImportacaoId, ItemImportacao>();

  async criarItem(params: RegistrarItemImportacaoParams): Promise<Result<ItemImportacao, ErroApp>> {
    const item: ItemImportacao = {
      itemImportacaoId: params.itemImportacaoId ?? randomUUID(),
      importacaoId: params.importacaoId,
      locatarioId: params.locatarioId,
      numeroLinha: params.numeroLinha,
      dadosBrutos: params.dadosBrutos,
      status: params.status,
      detalheErro: params.detalheErro ?? null,
      criadoEm: params.criadoEm,
    };

    this.itens.set(item.itemImportacaoId, item);
    return wrapOk(item);
  }

  async atualizarItem(item: ItemImportacao): Promise<Result<ItemImportacao, ErroApp>> {
    this.itens.set(item.itemImportacaoId, item);
    return wrapOk(item);
  }

  async buscarPorId(itemImportacaoId: ItemImportacaoId): Promise<Result<ItemImportacao | null, ErroApp>> {
    return wrapOk(this.itens.get(itemImportacaoId) ?? null);
  }

  async listarPorImportacao(importacaoId: ImportacaoId, locatarioId: LocatarioId): Promise<Result<ItemImportacao[], ErroApp>> {
    return wrapOk(
      [...this.itens.values()]
        .filter(
          (item) =>
            item.importacaoId === importacaoId &&
            item.locatarioId === locatarioId,
        )
        .sort((a, b) => a.numeroLinha - b.numeroLinha),
    );
  }
}
