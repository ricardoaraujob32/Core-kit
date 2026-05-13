// packages/core/src/auth/portasServico.ts

import { ContextoExecucao, ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";
import { ChaveToken } from "./tipos";

/**
 * Porta de hashing/comparação de senha usada por `auth`.
 *
 * Esta interface abstrai a verificação criptográfica do segredo do usuário.
 */
export interface HashAuthPorta {
  /**
   * 
   * @param senha 
   */
  gerarHashSenha(senha: string): Promise<Result<string, ErroApp>>;
  /**
   * Compara senha em texto puro com hash persistido.
   *
   * @param senha Senha recebida na borda.
   * @param senhaHash Hash persistido.
   * @returns `Ok(true/false)` conforme o resultado da comparação.
   */
  compararSenha(senha: string, senhaHash: string): Promise<Result<boolean, ErroApp>>;
}

/**
 * Porta de JWT usada por `auth`.
 *
 * Esta interface representa uma capacidade de serviço, e não um repositório,
 * porque sua responsabilidade é emitir e validar tokens, não persistir estado.
 */
export interface JwtAuthPorta {
  /**
   * Emite um access token com payload controlado pelo domínio.
   *
   * @param params Dados necessários para materializar a sessão.
   * @returns `Ok` com token e payload emitido.
   */
  emitirAccessToken(params: {
    usuarioId: UsuarioId;
    locatarioId: LocatarioId | null;
    sessionId: string;
    agora: Date;
    ttlSegundos: number;
    issuer: string;
  }): Promise<Result<
      {
        token: string;
        payload: {
          sub: UsuarioId;
          loc: LocatarioId;
          session: string;
          exp: number;
        };
      },
      ErroApp> >;

  /**
   * Valida um access token e devolve seu payload lógico.
   *
   * @param token Token recebido para validação.
   * @returns `Ok(payload)` quando o token é válido.
   */
  validarAccessToken(
    token: string,
  ): Result<
    {
      sub: UsuarioId;
      loc: LocatarioId | null;
      session: string;
      exp: number;
    },
    ErroApp>;
}

/**
 * Porta de serviço de tokens usada por `auth`.
 *
 * Esta interface concentra operações de alto nível sobre refresh tokens:
 * criação, validação e revogação.
 */
export interface TokensAuthPorta {
  /**
   * Cria um refresh token e seus metadados associados.
   *
   * @param params Contexto de emissão do refresh token.
   * @returns `Ok` com identificador, valor bruto e expiração.
   */
  criarRefresh(params: {
    usuarioId: UsuarioId;
    locatarioId: LocatarioId;
    agora: Date;
    ttlMs: number;
  }): Promise<
    Result<{
      chave: ChaveToken;
      tokenBruto: string;
      expiraEm: Date;
    }, ErroApp>
  >;

  /**
   * Valida um refresh token bruto.
   *
   * @param params Contexto de validação.
   * @returns `Ok` com os identificadores lógicos resolvidos.
   */
  validarRefresh(params: {
    tokenBruto: string;
    locatarioId: LocatarioId;
    agora: Date;
  }): Promise<
    Result<{
      chave: ChaveToken;
    }, ErroApp>
  >;

  /**
   * Revoga um refresh token.
   *
   * @param params Identificador do token e instante da revogação.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  revogar(params: {
    chave: ChaveToken;
    agora: Date;
    proximo?: ChaveToken;
  }): Promise<Result<void, ErroApp>>;
}

/**
 * Porta de serviço de RBAC usada por `auth`.
 *
 * Representa a capacidade de resolver autorização a partir de um contexto,
 * em vez de apenas consultar dados crus de papéis/permissões.
 */
export interface RbacAuthPorta {
  /**
   * Resolve papéis e permissões para o contexto informado.
   *
   * @param ctx Contexto base usado na resolução.
   * @returns `Ok` com papéis, permissões e contexto resultante.
   */
  resolverPermissoes(ctx: ContextoExecucao): Promise<Result<ContextoExecucao, ErroApp>>;
}

/**
 * Porta opcional para registro de eventos de segurança.
 *
 * Esta dependência não representa persistência principal do domínio de `auth`,
 * mas sim emissão de rastro operacional e auditoria de segurança.
 */
export interface EventosSegurancaPorta {
  /**
   * Registra um evento relevante de segurança/autenticação.
   *
   * @param params Tipo do evento, contexto envolvido e instante da ocorrência.
   * @returns `Promise<void>` porque o registro pode ser best-effort.
   */
  registrarEvento?(params: {
    tipo:
      | "auth.login.sucesso"
      | "auth.login.falha"
      | "auth.refresh"
      | "auth.logout";
    usuarioId?: UsuarioId | null;
    locatarioId?: LocatarioId | null;
    detalhes?: Record<string, unknown>;
    quando: Date;
  }): Promise<void>;
}
