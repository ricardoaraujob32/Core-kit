// packages/core/src/auth/portasServico.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { ContextoExecucaoRbac, ResolverPermissoesOutput } from "../rbac";
import { TokenId } from "../tokens";
import { UsuarioId } from "../usuarios";

/**
 * Projeção mínima de usuário usada pelos serviços de autenticação.
 *
 * Este tipo contém apenas os campos necessários para localizar o usuário,
 * validar credenciais e decidir se ele pode autenticar.
 */
export interface UsuarioAuth {
  /** Identificador do usuário. */
  usuarioId: UsuarioId;
  /** Locatário do usuário; `null` representa escopo de plataforma. */
  locatarioId: LocatarioId | null;
  /** E-mail de autenticação. */
  email: string;
  /** Hash persistido da senha. */
  senhaHash: string;
  /** Estado do usuário para fins de autenticação. */
  status: "ATIVO" | "INATIVO" | "SUSPENSO" | "ENCERRADO";
}

/**
 * Porta de consulta/atualização de usuários usada por serviços de autenticação.
 *
 * Embora o nome seja de serviço, esta interface tem semântica próxima de
 * repositório de leitura/escrita focado em `auth`.
 */
export interface UsuariosAuthPorta {
  /**
   * Busca usuário por e-mail no locatário.
   *
   * @param params Escopo do locatário e e-mail consultado.
   * @returns `Ok(usuario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorEmail(params: { locatarioId: LocatarioId; email: string; }): Promise<Result<UsuarioAuth | null, ErroApp>>;

  /**
   * Atualiza o instante do último login do usuário.
   *
   * @param params Usuário autenticado e instante da atualização.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  atualizarUltimoLogin(params: { usuarioId: UsuarioId; quando: Date; }): Promise<Result<void, ErroApp>>;
}

/**
 * Porta de consulta de locatários usada por serviços de autenticação.
 */
export interface LocatariosAuthPorta {
  /**
   * Busca locatário por identificador.
   *
   * @param params Identificador do locatário.
   * @returns `Ok(locatario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(params: {
    locatarioId: LocatarioId;
  }): Promise<
    Result<
      {
        locatarioId: LocatarioId;
        status: "ATIVO" | "SUSPENSO" | "ENCERRADO";
      } | null,
      ErroApp
    >
  >;
}

/**
 * Porta de hashing/comparação de senha usada por `auth`.
 *
 * Esta interface abstrai a verificação criptográfica do segredo do usuário.
 */
export interface HashAuthPorta {
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
    locatarioId: LocatarioId;
    sessionId: string;
    agora: Date;
    ttlSegundos: number;
    issuer: string;
  }): Promise<
    Result<
      {
        token: string;
        payload: {
          sub: UsuarioId;
          loc: LocatarioId;
          session: string;
          exp: number;
        };
      },
      ErroApp
    >
  >;

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
      loc: LocatarioId;
      session: string;
      exp: number;
    },
    ErroApp
  >;
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
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
    agora: Date;
    ttlMs: number;
  }): Promise<
    Result<
      {
        tokenId: TokenId;
        tokenBruto: string;
        expiraEm: Date;
      },
      ErroApp
    >
  >;

  /**
   * Valida um refresh token bruto.
   *
   * @param params Contexto de validação.
   * @returns `Ok` com os identificadores lógicos resolvidos.
   */
  validarRefresh(params: {
    locatarioId: LocatarioId;
    tokenBruto: string;
    agora: Date;
  }): Promise<
    Result<
      {
        tokenId: TokenId;
        usuarioId: UsuarioId;
        locatarioId: LocatarioId;
      },
      ErroApp
    >
  >;

  /**
   * Revoga um refresh token.
   *
   * @param params Identificador do token e instante da revogação.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  revogar(params: {
    tokenId: TokenId;
    agora: Date;
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
  resolverPermissoes(ctx: ContextoExecucaoRbac): Promise<Result<ResolverPermissoesOutput, ErroApp>>;
}
