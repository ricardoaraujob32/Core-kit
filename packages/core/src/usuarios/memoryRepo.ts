// packages/core/src/usuarios/memoryRepo.ts

import type { UsuariosRepo } from "./repo";
import type { Usuario } from "./types";

export function createUsuariosMemoryRepo(): UsuariosRepo {
  const data: Usuario[] = [];

  return {
    async findByNome(nome) {
      return data.find(u => u.nome === nome) ?? null;
    },

    async create(usuario) {
      data.push(usuario);
    },

    async list() {
      return [...data];
    },
  };
}
