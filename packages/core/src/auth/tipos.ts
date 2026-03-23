// packages/core/src/auth/tipos.ts

import type { ContextoExecucao, ErroApp, Result } from "../kernel";
import type { LocatarioId } from "../locatarios";
import type { UsuarioId } from "../usuarios";

/**
 * Entrada necessária para emissão de uma nova sessão autenticada.
 */
export interface EmitirSessaoInput {
  /** Locatário no qual o login será realizado. */
  locatarioId: LocatarioId;
  /** E-mail informado pelo usuário. */
  email: string;
  /** Senha em texto puro recebida na borda e validada pela operação. */
  senha: string;
}

/**
 * Conjunto de tokens e metadados temporais que materializam uma sessão.
 */
export interface Sessao {
  /** JWT de acesso de curta duração. */
  accessToken: string;
  /** Refresh token de maior duração. */
  refreshToken: string;
  /** Data/hora de expiração do access token. */
  accessExpiraEm: Date;
  /** Data/hora de expiração do refresh token. */
  refreshExpiraEm: Date;
}

/**
 * Payload esperado do JWT de autenticação.
 *
 * Este contrato representa a visão do domínio sobre os claims essenciais,
 * não necessariamente todos os campos presentes no token real.
 */
export interface JwtPayloadAuth {
  /** Identificador do usuário autenticado. */
  sub: UsuarioId;
  /** Identificador do locatário serializado no token. */
  loc: LocatarioId;
  /** Identificador lógico da sessão. */
  session: string;
  /** Instante de emissão em epoch seconds. */
  iat: number;
  /** Instante de expiração em epoch seconds. */
  exp: number;
  /** Emissor do token. */
  iss: string;
}

/**
 * Entrada para validação de uma sessão de acesso.
 */
export interface ValidarSessaoInput {
  /** Access token recebido do cliente. */
  accessToken: string;
}

/**
 * Resultado de uma validação bem-sucedida de sessão.
 */
export interface SessaoValidada {
  /** Locatário reconhecido a partir da sessão. */
  locatarioId: LocatarioId;
  /** Usuário autenticado na sessão. */
  usuarioId: UsuarioId;
  /** Identificador lógico da sessão. */
  sessionId: string;
  /** Data/hora de expiração do access token validado. */
  expiraEm: Date;
}

/**
 * Entrada para rotação de refresh token.
 */
export interface RotacionarRefreshInput {
  /** Locatário esperado para o refresh recebido. */
  locatarioId: LocatarioId;
  /** Refresh token bruto recebido do cliente. */
  refreshToken: string;
}

/**
 * Entrada para resolver o contexto autorizado a partir de uma sessão válida.
 */
export interface ResolverContextoAutorizadoInput {
  /** Sessão previamente validada. */
  sessao: SessaoValidada;
}

/**
 * Contexto autorizado resolvido pelo fluxo de autenticação.
 *
 * Observação arquitetural:
 * hoje este alias reutiliza o contexto local do RBAC, mas tende a convergir
 * para o contexto oficial do kernel para evitar duplicidade contratual.
 */
export type ContextoAutorizado = ContextoExecucao;

/**
 * Resultado assíncrono da emissão de sessão.
 */
export type ResultadoEmitirSessao = Promise<Result<Sessao, ErroApp>>;

/**
 * Resultado síncrono da validação de sessão.
 */
export type ResultadoValidarSessao = Result<SessaoValidada, ErroApp>;

/**
 * Resultado assíncrono da rotação de refresh token.
 */
export type ResultadoRotacionarRefresh = Promise<Result<Sessao, ErroApp>>;

/**
 * Resultado assíncrono da resolução do contexto autorizado.
 */
export type ResultadoResolverContextoAutorizado = Promise<Result<ContextoAutorizado, ErroApp>>;
