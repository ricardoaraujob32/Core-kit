// packages/core/src/exportacoes/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { Exportacao, ExportacaoId, RegistrarExportacaoParams } from "./tipos";

/**
 * 
 */
export interface ExportacoesRepositorio {
  criarExportacao(params: RegistrarExportacaoParams): Promise<Result<Exportacao, ErroApp>>;

  atualizarExportacao(exportacao: Exportacao): Promise<Result<Exportacao, ErroApp>>;

  buscarPorId(exportacaoId: ExportacaoId): Promise<Result<Exportacao | null, ErroApp>>;

  listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Exportacao[], ErroApp>>;
}
