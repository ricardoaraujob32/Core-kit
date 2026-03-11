// packages/core/src/auth/tipos.ts

import { ContextoExecucao } from "../contextoExecucao";
import { ErroApp } from "../erros";
import { LocatarioId } from "../locatarios/tipos";
import { Result } from "../result";
import { UsuarioId } from "../usuarios";

export type EmitirSessaoInput = {
  locatarioId: LocatarioId;
  email: string;
  senha: string;
  // opcional: "agora" vem do ContextoExecucao; nesta fase pode vir por injeção
};

export type Sessao = {
  accessToken: string;
  refreshToken: string;
  accessExpiraEm: Date;
  refreshExpiraEm: Date;
};

export type JwtPayload = {
  sub: string
  loc: string
  session: string
  iat: number
  exp: number
  iss: string
}

export type SessaoEmitida = {
  accessToken: string;
  refreshToken: string; // token bruto (somente retorno)
  accessExpiraEm: Date;
  refreshExpiraEm: Date;
};

export type ValidarSessaoInput = {
  accessToken: string;
};

export type SessaoValidada = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  sessionId: string;
  expiraEm: Date;
};

export type ResolverPermissoesInput = {
  ctx: ContextoExecucao; // exige usuarioId presente
};

export type ContextoAutorizado = ContextoExecucao; // enriquecido via comPermissoes/comPapeis

export type RotacionarRefreshInput = {
  locatarioId: LocatarioId;
  refreshToken: string; // bruto
};

export type SessaoRotacionada = {
  accessToken: string;
  accessExpiraEm: Date;
  refreshToken: string;
  refreshExpiraEm: Date;
};

export type ResolverContextoAutorizadoInput = {
  sessao: SessaoValidada;
};

export type ResultadoSessao = Promise<Result<Sessao, ErroApp>>;
export type ResultadoValidarSessao = Result<SessaoValidada, ErroApp>;
export type ResultadoContextoAutorizado = Promise<
  Result<ContextoExecucao, ErroApp>
>;