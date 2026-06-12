// packages/core/src/rbac/portasRepositorio.ts

import { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import { UsuarioId } from "../usuarios/index.js";
import { AutorizacaoSnapshot, Papel, Permissao } from "./tipos.js";

/**
 * Porta de leitura de dados de RBAC.
 *
 * Esta interface abstrai a recuperação de papéis e permissões efetivas
 * de um usuário no escopo de um locatário.
 */
export interface RbacRepositorio {
  /**
   * Lista os papéis atribuídos ao usuário no locatário.
   *
   * @param params Escopo do locatário e usuário consultado.
   * @returns `Ok` com a coleção de papéis reconhecidos.
   */
  listarPapeisDoUsuario(params: {locatarioId: LocatarioId; usuarioId: UsuarioId}): Promise<Result<Papel[], ErroApp>>;

  /**
   * Lista as permissões efetivas do usuário no locatário.
   *
   * O resultado deve refletir a autorização real usada pelo sistema,
   * independentemente de como os papéis tenham sido modelados na infraestrutura.
   *
   * @param params Escopo do locatário e usuário consultado.
   * @returns `Ok` com a coleção de permissões efetivas.
   */
  listarPermissoesEfetivasDoUsuario(params: {locatarioId: LocatarioId; usuarioId: UsuarioId}): Promise<Result<Permissao[], ErroApp>>;
}

/**
 * 
 */
export interface AutorizacaoRepositorio {
  /**
   * 
   * @param params 
   */
  obterSnapshot(params: {
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
    isPlataforma?: boolean;
  }): Promise<Result<AutorizacaoSnapshot, ErroApp>>;
}
