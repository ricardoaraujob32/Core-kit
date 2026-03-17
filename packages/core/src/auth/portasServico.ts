import type { Result } from "../kernel/result";
import type { ErroApp } from "../kernel/erros";
import type { IdPorta, RelogioPorta } from "../kernel/utils";
import type { LocatarioId } from "../locatarios";
import type { UsuarioId, Usuario } from "../usuarios";
import type { ContextoExecucaoRbac, ResolverPermissoesOutput } from "../rbac";
import type { TokenId } from "../tokens";

export interface UsuarioAuth {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId | null;
  email: string;
  senhaHash: string;
  status: "ATIVO" | "INATIVO" | "SUSPENSO" | "ENCERRADO";
}

export interface UsuariosAuthPorta {
  buscarPorEmail(params: {
    locatarioId: LocatarioId;
    email: string;
  }): Promise<Result<UsuarioAuth | null, ErroApp>>;

  atualizarUltimoLogin(params: {
    usuarioId: UsuarioId;
    quando: Date;
  }): Promise<Result<void, ErroApp>>;
}

export interface LocatariosAuthPorta {
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

export interface HashAuthPorta {
  compararSenha(
    senha: string,
    senhaHash: string,
  ): Promise<Result<boolean, ErroApp>>;
}

export interface JwtAuthPorta {
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

export interface TokensAuthPorta {
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

  revogar(params: {
    tokenId: TokenId;
    agora: Date;
  }): Promise<Result<void, ErroApp>>;
}

export interface RbacAuthPorta {
  resolverPermissoes(
    ctx: ContextoExecucaoRbac,
  ): Promise<Result<ResolverPermissoesOutput, ErroApp>>;
}

export interface EventosSegurancaPorta {
  registrarEvento?(params: {
    tipo:
      | "auth.login.sucesso"
      | "auth.login.falha"
      | "auth.refresh"
      | "auth.logout";
    usuarioId?: string | null;
    locatarioId?: string | null;
    detalhes?: Record<string, unknown>;
    quando: Date;
  }): Promise<void>;
}

export type { IdPorta, RelogioPorta };