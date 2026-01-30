/**
 * Arquivo: apps/api/src/infra/repositorioUsuariosPrisma.ts
 * Finalidade: Implementar o contrato RepositorioUsuarios usando Prisma + Postgres.
 *
 * Observações:
 * - Este repositório é multi-locatário: recebe locatarioId em todos os métodos.
 * - Nenhum locatário padrão/hardcoded é permitido.
 */

import type { RepositorioUsuarios, Usuario } from "@core-kit/core";
import type { LocatarioId } from "@core-kit/core";
import { clientePrisma } from "./prisma/client";

export function criarRepositorioUsuariosPrisma(): RepositorioUsuarios {
  return {
    async criarUsuario(locatarioId: LocatarioId, usuario: Usuario): Promise<void> {
      await clientePrisma.usuario.create({
        data: {
          id: usuario.id,
          locatarioId,
          nome: usuario.nome,
          status: usuario.status,
        },
      });
    },

    async buscarUsuarioPorNome(locatarioId: LocatarioId, nome: string): Promise<Usuario | null> {
      const registro = await clientePrisma.usuario.findUnique({
        where: { locatarioId_nome: { locatarioId, nome } },
      });

      if (!registro) return null;

      return {
        id: registro.id,
        nome: registro.nome,
        status: registro.status as Usuario["status"],
      };
    },

    async listarUsuarios(locatarioId: LocatarioId): Promise<Usuario[]> {
      const registros = await clientePrisma.usuario.findMany({
        where: { locatarioId },
        orderBy: { nome: "asc" },
      });

      return registros.map((registro) => ({
        id: registro.id,
        nome: registro.nome,
        status: registro.status as Usuario["status"],
      }));
    },
  };
}
