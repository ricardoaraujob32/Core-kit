// packages/core/src/tokens/portasRepositorio.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";
import { TokenId, TokenPersistido, TokenTipo } from "./tipos";

/**
 * Porta de persistência do domínio de tokens.
 *
 * Esta interface abstrai armazenamento, busca, revogação, listagem e
 * operações de encadeamento de rotação de tokens persistidos.
 *
 * Observação:
 * o arquivo atual contém assinaturas duplicadas de `buscarPorId` e `buscarPorHash`,
 * o que deve ser revisto em etapa posterior semântica/estrutural.
 */
export interface TokensRepositorio {
  /**
   * Insere diretamente uma entidade de token já materializada.
   *
   * @param token Token persistido pronto para armazenamento.
   * @returns `Ok(void)` quando a inserção é concluída.
   */
  inserir(token: TokenPersistido): Promise<Result<void, ErroApp>>;

  /**
   * Busca token por hash no escopo do locatário.
   *
   * @param params Escopo do locatário e hash do token.
   * @returns `Ok(token | null)` quando a consulta é bem-sucedida.
   */
  buscarPorHash(params: {locatarioId: LocatarioId; hashToken: string;}): Promise<Result<TokenPersistido | null, ErroApp>>;

  /**
   * Busca token por identificador no escopo do locatário.
   *
   * @param params Escopo do locatário e identificador do token.
   * @returns `Ok(token | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(params: {locatarioId: LocatarioId; tokenId: TokenId;}): Promise<Result<TokenPersistido | null, ErroApp>>;

  /**
   * Revoga um token persistido.
   *
   * @param params Dados necessários para registrar a revogação.
   * @returns `Ok(void)` quando a revogação é concluída.
   */
  revogar(params: {
    locatarioId: LocatarioId;
    tokenId: TokenId;
    revogadoPor: string;
    revogadoEm: Date;
    motivo?: string;
  }): Promise<Result<void, ErroApp>>;

  /**
   * Encadeia a rotação entre token antigo e token novo.
   *
   * Esta operação é opcional porque algumas implementações podem tratar a
   * rotação por outra estratégia transacional interna.
   *
   * @param params Relação entre token antigo e novo na cadeia de rotação.
   * @returns `Ok(void)` quando o encadeamento é persistido.
   */
  encadearRotacao?(params: {
    locatarioId: LocatarioId;
    tokenAntigoId: TokenId;
    tokenAntigoUsuarioId: UsuarioId;
    tokenNovoId: TokenId;
    tokenNovoUsuarioId: UsuarioId;
  }): Promise<Result<void, ErroApp>>;

  /**
   * Cria um novo registro de token a partir de seus campos estruturados.
   *
   * @param params Dados de persistência do token.
   * @returns `Ok` com o identificador criado.
   */
  criar(params: {
    tokenId: TokenId;
    usuarioId: UsuarioId;
    locatarioId: LocatarioId;
    hashToken: string;
    tipo: TokenTipo;
    emitidoEm: Date;
    expiraEm: Date;
    revogadoEm: Date | null;
    proximoTokenId: TokenId | null;
    agenteUsuario: string | null;
    enderecoIp: string | null;
  }): Promise<Result<{ tokenId: TokenId }, ErroApp>>;

  /**
   * Atualiza integralmente a representação persistida do token.
   *
   * @param token Entidade de token já validada pelo domínio.
   * @returns `Ok(tokenAtualizado)` quando a persistência é bem-sucedida.
   */
  atualizar(token: TokenPersistido): Promise<Result<TokenPersistido, ErroApp>>;

  /**
   * Busca token por identificador sem escopo explícito de locatário.
   *
   * @param params Identificador do token.
   * @returns `Ok(token | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(params: {
    tokenId: TokenId;
  }): Promise<Result<TokenPersistido | null, ErroApp>>;

  /**
   * Busca token por hash sem escopo explícito de locatário.
   *
   * @param params Hash do token.
   * @returns `Ok(token | null)` quando a consulta é bem-sucedida.
   */
  buscarPorHash(params: {
    hashToken: string;
  }): Promise<Result<TokenPersistido | null, ErroApp>>;

  /**
   * Lista tokens persistidos de um usuário em um locatário.
   *
   * @param params Usuário e locatário alvo da consulta.
   * @returns `Ok` com a coleção de tokens encontrados.
   */
  listarPorUsuario(params: {
    usuarioId: UsuarioId;
    locatarioId: LocatarioId;
  }): Promise<Result<TokenPersistido[], ErroApp>>;
}
