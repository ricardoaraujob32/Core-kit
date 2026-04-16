// packages/core/src/usuarios/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { Usuario, UsuarioId } from "./tipos";

/**
 * Porta de persistência do domínio de usuários.
 *
 * Esta interface isola o Core de detalhes de armazenamento de usuários,
 * incluindo consultas por identidade, e-mail, listagem contextual e atualização.
 */
export interface UsuariosRepositorio {
  /**
   * Persiste um novo usuário.
   *
   * @param params Dados completos necessários para criar o usuário.
   * @returns `Ok` com o identificador criado, ou `Err` em caso de falha.
   */
  criar(params: {
    usuarioId: UsuarioId;
    locatarioId: LocatarioId;
    email: string;
    nome: string;
    senhaHash: string;
    status: "ATIVO";
    ultimoLoginEm: Date | null;
    criadoEm: Date;
    atualizadoEm: Date;
    excluidoEm: Date | null;
  }): Promise<Result<{ usuarioId: UsuarioId }, ErroApp>>;

  /**
   * Busca um usuário por identificador dentro do escopo do locatário.
   *
   * @param params Identificador do locatário e do usuário desejado.
   * @returns `Ok(usuario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(params: {
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
  }): Promise<Result<Usuario | null, ErroApp>>;

  /**
   * Busca um usuário por e-mail normalizado dentro de um locatário.
   *
   * O `locatarioId` pode ser nulo para cenários de plataforma, conforme a
   * modelagem adotada pela aplicação.
   *
   * @param params Escopo e e-mail normalizado para a busca.
   * @returns `Ok(usuario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorEmailNoLocatario(params: {
    locatarioId: LocatarioId | null;
    emailNormalizado: string;
  }): Promise<Result<Usuario | null, ErroApp>>;

  /**
   * Lista usuários pertencentes a um locatário, com suporte a paginação simplificada.
   *
   * @param params Escopo do locatário, limite e cursor opcional.
   * @returns `Ok` com a coleção de usuários retornada pela consulta.
   */
   listarPorLocatario(params: {
    locatarioId: LocatarioId;
    limite?: number;
    cursor?: string;
  }): Promise<Result<Usuario[], ErroApp>>;

  /**
   * Atualiza integralmente a representação persistida de um usuário.
   *
   * @param usuario Entidade já validada pelo domínio.
   * @returns `Ok(usuarioAtualizado)` quando a persistência é bem-sucedida.
   */
  atualizar(usuario: Usuario): Promise<Result<Usuario, ErroApp>>;

  /**
   * Atualiza o instante do último login bem-sucedido do usuário.
   *
   * @param params Identificadores do escopo e instante do login.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  atualizarUltimoLogin(params: {
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
    quando: Date;
  }): Promise<Result<void, ErroApp>>;

  /**
   * 
   * @param params 
   */
  atualizarSenha(params: {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  senhaHash: string;
  atualizadoEm: Date;
}): Promise<Result<void, ErroApp>>;
}
