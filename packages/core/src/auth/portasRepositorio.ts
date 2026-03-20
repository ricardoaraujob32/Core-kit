// packages/core/src/auth/portasRepositorio.ts

import { ContextoExecucao, ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { ResolverPermissoesOutput } from "../rbac";
import { UsuarioId } from "../usuarios";


/**
 * 
 */
export type UsuarioAuth = {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId | null; // NULL = plataforma (superadmin)
  email: string;
  senhaHash: string;
  status: "ATIVO" | "INATIVO" | "BLOQUEADO"; // conforme enum do BD
};

/**
 * 
 */
export interface UsuariosRepositorioAuth {
  buscarPorEmail(params: { locatarioId: LocatarioId; email: string }): Promise<Result<UsuarioAuth | null, ErroApp>>;
  atualizarUltimoLogin(params: { usuarioId: UsuarioId; quando: Date }): Promise<Result<void, ErroApp>>;
}

/**
 * 
 */
export interface RbacRepositorio {
  listarPapeisDoUsuario(params: { usuarioId: UsuarioId; locatarioId: LocatarioId }): Promise<Result<string[], ErroApp>>;
  listarPermissoesDoUsuario(params: { usuarioId: UsuarioId; locatarioId: LocatarioId }): Promise<Result<string[], ErroApp>>;
}

/**
 * 
 */
export interface CriptoPorta {
  compararSenha(senha: string, senhaHash: string): Promise<Result<boolean, ErroApp>>;
  hashToken(tokenBruto: string): Promise<Result<string, ErroApp>>;
  gerarTokenSeguro(): Promise<Result<string, ErroApp>>; // para refresh bruto
}

/**
 * 
 */
export interface JwtPorta {
  emitirAccessToken(params: { usuarioId: UsuarioId; locatarioId: LocatarioId; ttlSegundos: number }): Promise<Result<{ token: string; expiraEm: Date }, ErroApp>>;
  validarAccessToken(token: string): Promise<Result<{ usuarioId: UsuarioId; locatarioId: LocatarioId; expiraEm: Date }, ErroApp>>;
}

/**
 * 
 */
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

/**
 * 
 */
export interface LocatariosRepositorioAuth {
  buscarPorId(params: { locatarioId: LocatarioId }): Promise<Result<{ locatarioId: LocatarioId; status: "ATIVO" | "SUSPENSO" | "ENCERRADO" } | null, ErroApp>>;
}

/**
 * 
 */
export interface RbacServicePorta {
  resolverPermissoes(ctx: ContextoExecucao): Promise<Result<ResolverPermissoesOutput, ErroApp>>;
}

/**
 * 
 */
export interface CriptoAuthPorta {
  compararSenha(senha: string, senhaHash: string): Promise<Result<boolean, ErroApp>>;
}

/**
 * 
 */
export interface JwtPorta {
  emitirAccessToken(params: { usuarioId: UsuarioId; locatarioId: LocatarioId; ttlSegundos: number })
    : Promise<Result<{ token: string; expiraEm: Date }, ErroApp>>;

  validarAccessToken(token: string)
    : Promise<Result<{ usuarioId: UsuarioId; locatarioId: LocatarioId; expiraEm: Date }, ErroApp>>;
}

/**
 * 
 */
export interface EventosSegurancaPorta {
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
