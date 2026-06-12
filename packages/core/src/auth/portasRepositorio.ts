// packages/core/src/auth/portasRepositorio.ts

import { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId, LocatarioSlug } from "../locatarios/index.js";
import { UsuarioId } from "../usuarios/index.js";
import { LocatarioAuth, UsuarioAuth } from "./tipos.js";

/**
 * Porta de consulta e atualização de usuários para o fluxo de autenticação.
 *
 * Observação:
 * o arquivo atual contém esta interface mais de uma vez. A duplicação deve ser
 * consolidada futuramente, mas sem alterar a estrutura agora.
 */
export interface UsuariosRepositorioAuth {
  /**
   * Busca usuário por e-mail no escopo do locatário.
   *
   * @param params Locatário e e-mail consultado.
   * @returns `Ok(usuario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorEmail(params: { locatarioId: LocatarioId; email: string }): Promise<Result<UsuarioAuth | null, ErroApp>>;

  /**
   * Atualiza o instante do último login do usuário.
   *
   * @param params Usuário autenticado e instante do login.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  atualizarUltimoLogin(params: { usuarioId: UsuarioId; quando: Date }): Promise<Result<void, ErroApp>>;

  /**
   * 
   * @param params 
   */
  buscarUsuarioPlataformaPorEmail(params: { email: string }): Promise<Result<UsuarioAuth | null, ErroApp>>;
}

/**
 * Porta de consulta de locatários usada no fluxo de autenticação.
 *
 * Permite verificar existência e status do locatário antes da emissão da sessão.
 */
export interface LocatariosRepositorioAuth {
  /**
   * Busca locatário por identificador.
   *
   * @param params Identificador do locatário.
   * @returns `Ok(locatario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorSlug(params: { locatarioSlug: LocatarioSlug }): Promise<Result<LocatarioAuth | null, ErroApp>>;
}
