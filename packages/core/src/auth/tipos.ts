// packages/core/src/auth/tipos.ts

import type { ContextoExecucao, ErroApp, Result } from "../kernel";
import type { LocatarioId, LocatarioSlug } from "../locatarios";
import type { UsuarioId } from "../usuarios";

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
 * Projeção mínima de usuário usada pelos fluxos de autenticação.
 *
 * Este tipo representa apenas os campos necessários para login,
 * validação de credenciais e materialização de sessão.
 */
export type UsuarioAuth = {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId | null; // NULL = plataforma (superadmin)
  email: string;
  senhaHash: string;
  status: "ATIVO" | "INATIVO" | "BLOQUEADO"; // conforme enum do BD
};

/**
 * Dados mínimos de um locatário retornados pelo serviço de autenticação
 */
export type LocatarioAuth = {
  locatarioId: LocatarioId;
  status: "ATIVO" | "SUSPENSO" | "EXCLUIDO";
};

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
 * Entrada necessária para emissão de uma nova sessão autenticada.
 */
export interface EmitirSessaoInput {
  /** Locatário no qual o login será realizado. */
  locatarioSlug: LocatarioSlug;
  /** E-mail informado pelo usuário. */
  email: string;
  /** Senha em texto puro recebida na borda e validada pela operação. */
  senha: string;
}

/**
 * Saída da emissão de sessão.
 */
export interface EmitirSessaoOutput {
  sessao: Sessao;
}

/**
 * Resultado assíncrono da emissão de sessão.
 */
export type EmitirSessaoResult = Promise<Result<EmitirSessaoOutput, ErroApp>>;

/**
 * Entrada para validação de uma sessão de acesso.
 */
export interface ValidarSessaoInput {
  /** Access token recebido do cliente. */
  accessToken: string;
}

/**
 * Saída da validação de sessão.
 */
export interface ValidarSessaoOutput {
  sessao: SessaoValidada;
}

/**
 * Resultado síncrono da validação de sessão.
 */
export type ValidarSessaoResult = Result<ValidarSessaoOutput, ErroApp>;

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
 * Saída da rotação de refresh token.
 */
export interface RotacionarRefreshOutput {
  sessao: Sessao;
}

/**
 * Resultado assíncrono da rotação de refresh token.
 */
export type RotacionarRefreshResult = Promise<Result<RotacionarRefreshOutput, ErroApp>>;

/**
 * Entrada para resolver o contexto autorizado a partir de uma sessão válida.
 */
export interface ResolverContextoAutorizadoInput {
  /** Sessão previamente validada. */
  sessao: SessaoValidada;
}

/**
 * Saída da resolução do contexto autorizado.
 */
export interface ResolverContextoAutorizadoOutput {
  ctx: ContextoExecucao;
}

/**
 * Resultado assíncrono da resolução do contexto autorizado.
 */
export type ResolverContextoAutorizadoResult = Promise<Result<ResolverContextoAutorizadoOutput, ErroApp>>;
