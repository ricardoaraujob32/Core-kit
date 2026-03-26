// packages/core/src/auth/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

/**
 * Projeção mínima de usuário usada pelos fluxos de autenticação.
 *
 * Este tipo representa apenas os campos necessários para login,
 * validação de credenciais e materialização de sessão.
 */
export type UsuarioAuth = {
  /** Identificador do usuário autenticado. */
  usuarioId: UsuarioId;
  /** Locatário do usuário; `null` representa escopo de plataforma. */
  locatarioId: LocatarioId | null; // NULL = plataforma (superadmin)
  /** E-mail de autenticação do usuário. */
  email: string;
  /** Hash da senha persistida. */
  senhaHash: string;
  /** Estado atual do usuário para fins de autenticação. */
  status: "ATIVO" | "INATIVO" | "BLOQUEADO"; // conforme enum do BD
};

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
  buscarPorId(params: { locatarioId: LocatarioId }): Promise<Result<{ locatarioId: LocatarioId; status: "ATIVO" | "SUSPENSO" | "ENCERRADO" } | null, ErroApp>>;
}
