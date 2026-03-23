// packages/core/src/exportacoes/repositorioMemoria.ts

import { randomUUID } from "node:crypto";
import { ErroApp, Result, wrapOk } from "../kernel";
import { ExportacoesRepositorio } from "./portasRepositorio";
import { Exportacao, ExportacaoId, RegistrarExportacaoParams } from "./tipos";
import { LocatarioId } from "../locatarios";

/**
 * Implementação em memória da porta `ExportacoesRepositorio`.
 *
 * Esta classe existe para testes unitários do domínio de exportações,
 * mantendo os registros em um `Map` indexado por `exportacaoId`.
 */
export class ExportacoesRepositorioMemoria implements ExportacoesRepositorio {
  /** Armazena exportações indexadas por `exportacaoId`. */
  private readonly itens = new Map<ExportacaoId, Exportacao>();

  /**
   * Cria e persiste uma nova exportação em memória.
   *
   * Quando `params.exportacaoId` não é informado, um UUID aleatório é gerado.
   *
   * @param params Dados estruturados de registro da exportação.
   * @returns `Ok(exportacao)` com a entidade persistida.
   */
  async criarExportacao(params: RegistrarExportacaoParams): Promise<Result<Exportacao, ErroApp>> {
    const exportacao: Exportacao = {
      exportacaoId: params.exportacaoId ?? randomUUID(),
      locatarioId: params.locatarioId,
      criadoPorUsuarioId: params.criadoPorUsuarioId ?? null,
      formato: params.formato,
      status: params.status,
      parametros: params.parametros,
      referenciaResultado: params.referenciaResultado ?? null,
      mensagemErro: params.mensagemErro ?? null,
      criadoEm: params.criadoEm,
      atualizadoEm: params.atualizadoEm,
    };

    this.itens.set(exportacao.exportacaoId, exportacao);
    return wrapOk(exportacao);
  }

  /**
   * Atualiza integralmente uma exportação persistida em memória.
   *
   * @param exportacao Entidade de exportação a ser substituída no estado interno.
   * @returns `Ok(exportacao)` com a própria entidade atualizada.
   */
  async atualizarExportacao(exportacao: Exportacao): Promise<Result<Exportacao, ErroApp>> {
    this.itens.set(exportacao.exportacaoId, exportacao);
    return wrapOk(exportacao);
  }

  /**
   * Busca uma exportação por identificador.
   *
   * @param exportacaoId Identificador da exportação.
   * @returns `Ok(exportacao | null)` quando a consulta é concluída.
   */
  async buscarPorId(exportacaoId: ExportacaoId): Promise<Result<Exportacao | null, ErroApp>> {
    return wrapOk(this.itens.get(exportacaoId) ?? null);
  }

  /**
   * Lista exportações pertencentes a um locatário, ordenadas da mais recente
   * para a mais antiga segundo `criadoEm`.
   *
   * @param locatarioId Locatário alvo da consulta.
   * @returns `Ok` com a coleção ordenada de exportações.
   */
  async listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Exportacao[], ErroApp>> {
    return wrapOk(
      [...this.itens.values()]
        .filter((item) => item.locatarioId === locatarioId)
        .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()),
    );
  }
}
