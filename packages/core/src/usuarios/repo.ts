// packages/core/src/usuarios/repo.ts

import type { Usuario, IdUsuario } from "./types";

export type UsuariosRepo = {
  /**
   * Retorna null se não existir
   */
findById(id: IdUsuario): Promise<Usuario | null>;

  /**
   * Busca por igualdade (case-sensitive por padrão).
   * Se quiser normalizar/case-insensitive, isso vira regra no usecase ou no repo.
   */
  findByNome(nome: string): Promise<Usuario | null>;

  list(): Promise<Usuario[]>;

  create(user: Usuario): Promise<void>;
};
