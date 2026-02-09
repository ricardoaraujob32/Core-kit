// apps/api/src/infra/repositorioUsuariosPrisma.ts
import type { RepositorioUsuarios } from "@core-kit/core";
import { prisma } from "./prismaClient"; // seu client central
import type { IdLocatario, IdUsuario } from "@core-kit/core";

export const repositorioUsuariosPrisma: RepositorioUsuarios = {
  async obterPorId(locatarioId: IdLocatario, id: IdUsuario) {
    return prisma.usuario.findFirst({ where: { id, locatarioId } });
  },
  async obterPorNome(locatarioId, nome) {
    return prisma.usuario.findFirst({ where: { locatarioId, nome } });
  },
  async listar(locatarioId) {
    return prisma.usuario.findMany({ where: { locatarioId } });
  },
  async criar(dados) {
    return prisma.usuario.create({ data: { ...dados, status: "ATIVO" } });
  }
};
