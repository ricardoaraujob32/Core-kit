// packages/core/src/locatarios/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel";
import type { Locatario, LocatarioId } from "./tipos";

/**
 * Porta de persistência do domínio de locatários.
 *
 * Esta interface abstrai o armazenamento e a recuperação de locatários,
 * permitindo que o Core manipule o agregado sem conhecer banco, ORM,
 * SQL ou qualquer detalhe de infraestrutura.
 */
export interface LocatariosRepositorio {
  /**
   * Persiste um novo locatário no repositório.
   *
   * @param params Dados necessários para criação do locatário.
   * @returns `Ok` com o identificador criado, ou `Err` em caso de falha.
   */
  criar(params: {
    locatarioId: LocatarioId;
    nome: string;
    status: "ATIVO";
    criadoEm: Date;
  }): Promise<Result<{ locatarioId: LocatarioId }, ErroApp>>;

  /**
   * Busca um locatário por sua identidade lógica.
   *
   * @param params Identificador do locatário desejado.
   * @returns `Ok(locatario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(params: {locatarioId: LocatarioId}): Promise<Result<Locatario | null, ErroApp>>;

  /**
   * Lista todos os locatários visíveis ao contexto da implementação.
   *
   * @returns `Ok` com a coleção de locatários encontrados.
   */
  listar(): Promise<Result<Locatario[], ErroApp>>;
}
