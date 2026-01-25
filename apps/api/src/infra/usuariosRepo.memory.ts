// apps/api/src/infra/usuariosRepo.memory.ts
import type { Usuario } from "packages/core/src/usuarios/types";
import type { IdUsuario, UsuariosRepo } from "@core-kit/core";

export function createUsuariosRepoMemory(): UsuariosRepo {
  const byId = new Map<IdUsuario, Usuario>();

  return {
    async findById(id) {
      return byId.get(id) ?? null;
    },

    async findByNome(nome) {
      for (const u of byId.values()) {
        if (u.nome === nome) return u;
      }
      return null;
    },

    async list() {
      return Array.from(byId.values());
    },

    async create(user) {
      byId.set(user.id, user);
    },
  };
}
