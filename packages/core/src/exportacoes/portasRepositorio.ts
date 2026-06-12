// packages/core/src/exportacoes/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { Exportacao, ExportacaoId, RegistrarExportacaoParams } from "./tipos";

/**
 * Porta de persistência do agregado de exportações.
 *
 * Esta interface abstrai criação, atualização, consulta e listagem de
 * exportações sem expor detalhes de banco ou infraestrutura.
 */
export interface ExportacoesRepositorio {
  /**
   * Cria uma nova exportação persistida.
   *
   * @param params Dados estruturados de registro da exportação.
   * @returns `Ok(exportacao)` com a entidade criada.
   */
  criarExportacao(params: RegistrarExportacaoParams): Promise<Result<Exportacao, ErroApp>>;

  /**
   * Atualiza integralmente uma exportação persistida.
   *
   * @param exportacao Entidade já validada pelo domínio.
   * @returns `Ok(exportacaoAtualizada)` quando a persistência é bem-sucedida.
   */
  atualizarExportacao(exportacao: Exportacao): Promise<Result<Exportacao, ErroApp>>;

  /**
   * Busca uma exportação por identificador.
   *
   * @param exportacaoId Identificador da exportação.
   * @returns `Ok(exportacao | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(exportacaoId: ExportacaoId): Promise<Result<Exportacao | null, ErroApp>>;

  /**
   * Lista exportações pertencentes a um locatário.
   *
   * @param locatarioId Identificador do locatário consultado.
   * @returns `Ok` com a coleção de exportações encontradas.
   */
  listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Exportacao[], ErroApp>>;
}
