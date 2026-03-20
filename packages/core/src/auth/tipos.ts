// packages/core/src/auth/tipos.ts

import type { ErroApp, Result } from "../kernel";
import type { LocatarioId } from "../locatarios";
import type { UsuarioId } from "../usuarios";
import type { ContextoExecucaoRbac } from "../rbac";

/**
 * 
 */
export interface EmitirSessaoInput {
  locatarioId: LocatarioId;
  email: string;
  senha: string;
}

/**
 * 
 */
export interface Sessao {
  accessToken: string;
  refreshToken: string;
  accessExpiraEm: Date;
  refreshExpiraEm: Date;
}

/**
 * 
 */
export interface JwtPayloadAuth {
  sub: UsuarioId;
  loc: LocatarioId;
  session: string;
  iat: number;
  exp: number;
  iss: string;
}

/**
 * 
 */
export interface ValidarSessaoInput {
  accessToken: string;
}

/**
 * 
 */
export interface SessaoValidada {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  sessionId: string;
  expiraEm: Date;
}

/**
 * 
 */
export interface RotacionarRefreshInput {
  locatarioId: LocatarioId;
  refreshToken: string;
}

/**
 * 
 */
export interface ResolverContextoAutorizadoInput {
  sessao: SessaoValidada;
}

/**
 * 
 */
export type ContextoAutorizado = ContextoExecucaoRbac;

/**
 * 
 */
export type ResultadoEmitirSessao = Promise<Result<Sessao, ErroApp>>;

/**
 * 
 */
export type ResultadoValidarSessao = Result<SessaoValidada, ErroApp>;

/**
 * 
 */
export type ResultadoRotacionarRefresh = Promise<Result<Sessao, ErroApp>>;

/**
 * 
 */
export type ResultadoResolverContextoAutorizado = Promise< Result<ContextoAutorizado, ErroApp> >;
