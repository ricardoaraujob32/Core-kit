// packages/core/src/usuarios/tipos.ts

import type { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";

/**
 * 
 */
export type UsuarioId = string;

/**
 * 
 */
export type StatusUsuario =
  | "ATIVO"
  | "INATIVO"
  | "SUSPENSO"
  | "ENCERRADO";

/**
 * 
 */
  export interface Usuario {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId | null;
  email: string;
  nome: string;
  senhaHash: string;
  status: StatusUsuario;
  ultimoLoginEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
  excluidoEm: Date | null;
}

/**
 * 
 */
export interface CriarUsuarioInput {
  locatarioId: LocatarioId;
  email: string;
  nome: string;
  senhaHash: string;
}

/**
 * 
 */
export interface CriarUsuarioOutput {
  usuarioId: UsuarioId;
}

/**
 * 
 */
export interface ObterUsuarioInput {
  usuarioId: UsuarioId;
}

/**
 * 
 */
export interface AtualizarUsuarioInput {
  usuarioId: UsuarioId;
  nome?: string;
  email?: string;
}

/**
 * 
 */
export interface InativarUsuarioInput {
  usuarioId: UsuarioId;
}

/**
 * 
 */
export interface ReativarUsuarioInput {
  usuarioId: UsuarioId;
}

/**
 * 
 */
export interface ListarUsuariosPorLocatarioInput {
  locatarioId: LocatarioId;
}

/**
 * 
 */
export interface ListarUsuariosPorLocatarioOutput {
  itens: Usuario[];
}

/**
 * 
 */
export type ResultadoCriarUsuario = Promise< Result<CriarUsuarioOutput, ErroApp> >;

/**
 * 
 */
export type ResultadoObterUsuario = Promise< Result<Usuario, ErroApp> >;

/**
 * 
 */
export type ResultadoAtualizarUsuario = Promise< Result<Usuario, ErroApp> >;

/**
 * 
 */
export type ResultadoInativarUsuario = Promise< Result<Usuario, ErroApp> >;

/**
 * 
 */
export type ResultadoReativarUsuario = Promise< Result<Usuario, ErroApp> >;

/**
 * 
 */
export type ResultadoListarUsuariosPorLocatario = Promise< Result<ListarUsuariosPorLocatarioOutput, ErroApp> >;