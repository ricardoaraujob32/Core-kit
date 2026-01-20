/**
 * Tipos base para multi-locatário (multi-tenant).
 * "Locatário" é a empresa/cliente dono do contexto.
 */

export type LocatarioId = string;
export type UsuarioId = string;

export type ContextoExecucao = {
  locatarioId: LocatarioId;
  usuarioId?: UsuarioId;
  papeis?: string[]; // depois vamos padronizar como enum/union
};
