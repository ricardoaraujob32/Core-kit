// packages/core/src/exportacoes/repositorioMemoria.ts

import { randomUUID } from "node:crypto";
import { ErroApp, Result, wrapOk } from "../kernel";
import { ExportacoesRepositorio } from "./portasRepositorio";
import { Exportacao, ExportacaoId, RegistrarExportacaoParams } from "./tipos";
import { LocatarioId } from "../locatarios";

/**
 * 
 */
export class ExportacoesRepositorioMemoria implements ExportacoesRepositorio {
  private readonly itens = new Map<ExportacaoId, Exportacao>();

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

  async atualizarExportacao(exportacao: Exportacao): Promise<Result<Exportacao, ErroApp>> {
    this.itens.set(exportacao.exportacaoId, exportacao);
    return wrapOk(exportacao);
  }

  async buscarPorId(exportacaoId: ExportacaoId): Promise<Result<Exportacao | null, ErroApp>> {
    return wrapOk(this.itens.get(exportacaoId) ?? null);
  }

  async listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Exportacao[], ErroApp>> {
    return wrapOk(
      [...this.itens.values()]
        .filter((item) => item.locatarioId === locatarioId)
        .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()),
    );
  }
}
