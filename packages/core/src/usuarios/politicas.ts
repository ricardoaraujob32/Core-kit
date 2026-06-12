// packages/core/src/usuarios/politicas.ts

import type { Result, ErroApp } from "../kernel/index.js";
import type { LocatarioId } from "../locatarios/index.js";
import type { Usuario, UsuarioId } from "./tipos.js";

/**
 * 
 */
export type OperacaoPoliticaUsuario =
  | "USUARIO_CRIAR"
  | "USUARIO_LISTAR"
  | "USUARIO_OBTER"
  | "USUARIO_ATUALIZAR"
  | "USUARIO_DESATIVAR"
  | "USUARIO_REATIVAR"
  | "USUARIO_ALTERAR_SENHA"
  | "USUARIO_REDEFINIR_SENHA";

/**
 * 
 */
export type EntradaPoliticaUsuario = {
  operacao: OperacaoPoliticaUsuario;
  locatarioId?: LocatarioId | null;
  usuarioId?: UsuarioId | null;
  usuario?: Usuario | null;
  dados?: Record<string, unknown>;
};

/**
 * 
 */
export type PoliticaSegurancaUsuariosPorta = {
  autorizar(input: EntradaPoliticaUsuario): Promise<Result<void, ErroApp>>;
};

/**
 * 
 */
export type DepsPoliticaSegurancaUsuarios = {
  politicaSeguranca?: PoliticaSegurancaUsuariosPorta;
};

/**
 * 
 * @param deps 
 * @param input 
 * @returns 
 */
export async function autorizarUsuario(deps: DepsPoliticaSegurancaUsuarios, input: EntradaPoliticaUsuario): Promise<Result<void, ErroApp> | null> {
  if (!deps.politicaSeguranca) return null;
  return deps.politicaSeguranca.autorizar(input);
}