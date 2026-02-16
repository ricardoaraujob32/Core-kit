// packages/core/src/usuarios/tipos.ts

import { LocatarioId } from "../locatario";

/**
 * 
 */
export type StatusUsuario = "ATIVO" | "INATIVO" | "BLOQUEADO";

/**
 * 
 */
export type UsuarioId = string;

/**
 * 
 */
export type Usuario = {
  id: UsuarioId;
  locatarioId: LocatarioId;
  nome: string;
  status: StatusUsuario;
  criadoEm: Date;
  atualizadoEm: Date;
};

/**
 * 
 */
export type NovoUsuario = {
  locatarioId: LocatarioId;
  nome: string;
}