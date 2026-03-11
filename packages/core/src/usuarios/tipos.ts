// packages/core/src/usuarios/tipos.ts

import { ErroApp } from "../erros";
import { Result } from "../result";

/**
 * 
 */
export type UsuarioId = string;
export type UsuarioStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";

export type Usuario = {
  usuarioId: UsuarioId;
  locatarioId: string | null; // null = plataforma (superadmin)
  email: string;
  senhaHash: string;
  status: UsuarioStatus;
  criadoEm: Date;
  ultimoLoginEm?: Date | null;
};

export type CriarUsuarioInput = {
  locatarioId: string;
  email: string;
  senhaHash: string; // já vem do auth/cripto
  status?: UsuarioStatus; // default ATIVO
};

export type CriarUsuarioOutput = {
  usuarioId: UsuarioId;
};

export type ObterUsuarioInput = {
  locatarioId: string;
  usuarioId: UsuarioId;
};

export type ListarUsuariosInput = {
  locatarioId: string;
  limite?: number;
  cursor?: string; // opcional
};

export type ListarUsuariosOutput = {
  itens: Usuario[];
};

export type ResultadoCriarUsuario = Promise<
  Result<CriarUsuarioOutput, ErroApp>
>;

export type ResultadoObterUsuario = Promise<Result<Usuario, ErroApp>>;

export type ResultadoListarUsuarios = Promise<
  Result<ListarUsuariosOutput, ErroApp>
>;