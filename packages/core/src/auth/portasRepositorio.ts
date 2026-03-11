// packages/core/src/auth/portasRepositorio.ts

import { ContextoExecucao } from "../contextoExecucao";
import { ErroApp } from "../erros";
import { LocatarioId } from "../locatarios/tipos";
import { Result } from "../result";
import { ResolverPermissoesOutput } from "../rbac/tipos";
import { TokenId } from "../tokens";
import { UsuarioId } from "../usuarios";

export type UsuarioAuth = {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId | null; // NULL = plataforma (superadmin)
  email: string;
  senhaHash: string;
  status: "ATIVO" | "INATIVO" | "BLOQUEADO"; // conforme enum do BD
};

export interface UsuariosRepositorioAuth {
  buscarPorEmail(params: { locatarioId: LocatarioId; email: string }): Promise<Result<UsuarioAuth | null, ErroApp>>;
  atualizarUltimoLogin(params: { usuarioId: UsuarioId; quando: Date }): Promise<Result<void, ErroApp>>;
}


export type TokenPersistido = {
  tokenId: TokenId;
  usuarioId: UsuarioId;
  locatarioId: LocatarioId;
  tipo: "REFRESH" | "RECUPERACAO_SENHA" | "CONFIRMACAO_EMAIL";
  hashToken: string;
  expiraEm: Date;
  revogadoEm: Date | null;
};

export interface TokensRepositorio {
  inserir(token: TokenPersistido): Promise<Result<void, ErroApp>>;
  buscarPorHash(hashToken: string): Promise<Result<TokenPersistido | null, ErroApp>>;
  revogar(params: { tokenId: TokenId; usuarioId: UsuarioId; quando: Date; motivo?: string }): Promise<Result<void, ErroApp>>;

  // opcional (se implementar rotação já):
  encadearRotacao(params: {
    tokenAntigoId: TokenId;
    tokenAntigoUsuarioId: UsuarioId;
    tokenNovoId: TokenId;
    tokenNovoUsuarioId: UsuarioId;
  }): Promise<Result<void, ErroApp>>;
}



export interface RbacRepositorio {
  listarPapeisDoUsuario(params: { usuarioId: UsuarioId; locatarioId: LocatarioId }): Promise<Result<string[], ErroApp>>;
  listarPermissoesDoUsuario(params: { usuarioId: UsuarioId; locatarioId: LocatarioId }): Promise<Result<string[], ErroApp>>;
}


export interface CriptoPorta {
  compararSenha(senha: string, senhaHash: string): Promise<Result<boolean, ErroApp>>;
  hashToken(tokenBruto: string): Promise<Result<string, ErroApp>>;
  gerarTokenSeguro(): Promise<Result<string, ErroApp>>; // para refresh bruto
}

export interface JwtPorta {
  emitirAccessToken(params: { usuarioId: UsuarioId; locatarioId: LocatarioId; ttlSegundos: number }): Promise<Result<{ token: string; expiraEm: Date }, ErroApp>>;
  validarAccessToken(token: string): Promise<Result<{ usuarioId: UsuarioId; locatarioId: LocatarioId; expiraEm: Date }, ErroApp>>;
}

export interface UsuariosRepositorioAuth {
  buscarPorEmail(params: { locatarioId: LocatarioId; email: string }): Promise<Result<{
    usuarioId: UsuarioId;
    locatarioId: LocatarioId | null;
    email: string;
    senhaHash: string;
    status: "ATIVO" | "INATIVO" | "BLOQUEADO";
  } | null, ErroApp>>;

  atualizarUltimoLogin(params: { locatarioId: LocatarioId; usuarioId: UsuarioId; quando: Date }): Promise<Result<void, ErroApp>>;
}

export interface LocatariosRepositorioAuth {
  buscarPorId(params: { locatarioId: LocatarioId }): Promise<Result<{ locatarioId: LocatarioId; status: "ATIVO" | "SUSPENSO" | "ENCERRADO" } | null, ErroApp>>;
}

export interface TokensServicePorta {
  criarRefresh(params: { locatarioId: LocatarioId; usuarioId: UsuarioId; agora: Date; ttlMs: number })
    : Promise<Result<{ tokenBruto: string; tokenId: TokenId; expiraEm: Date }, ErroApp>>;

  validarRefresh(params: { locatarioId: LocatarioId; tokenBruto: string; agora: Date })
    : Promise<Result<{ tokenId: TokenId; usuarioId: UsuarioId; expiraEm: Date }, ErroApp>>;

  revogar(params: { locatarioId: LocatarioId; tokenId: TokenId; usuarioId: UsuarioId; agora: Date; motivo?: string })
    : Promise<Result<void, ErroApp>>;

  // opcional: encadearRotacao...
}

export interface RbacServicePorta {
  resolverPermissoes(ctx: ContextoExecucao): Promise<Result<ResolverPermissoesOutput, ErroApp>>;
}

export interface CriptoAuthPorta {
  compararSenha(senha: string, senhaHash: string): Promise<Result<boolean, ErroApp>>;
}

export interface JwtPorta {
  emitirAccessToken(params: { usuarioId: UsuarioId; locatarioId: LocatarioId; ttlSegundos: number })
    : Promise<Result<{ token: string; expiraEm: Date }, ErroApp>>;

  validarAccessToken(token: string)
    : Promise<Result<{ usuarioId: UsuarioId; locatarioId: LocatarioId; expiraEm: Date }, ErroApp>>;
}

export type Relogio = { agora(): Date };

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

export interface IdPorta {
  gerarId(): string;
}

export type RelogioPorta = Relogio;