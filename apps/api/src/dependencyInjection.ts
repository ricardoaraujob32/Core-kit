import { repositorioUsuariosPrisma } from "./infra/repositorioUsuariosPrisma";
import { auditoriaDb } from "./infra/auditoriaDb";

export const deps = {
  usuariosRepo: repositorioUsuariosPrisma,
  auditoria: auditoriaDb
};
