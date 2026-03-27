// apps/api/src/infra/prisma/auth/locatarios/locatariosRepositorioAuthPrisma.ts

import { ErroApp, LocatarioAuth, LocatarioId, LocatariosRepositorioAuth, Result, wrapOk } from "@core-kit/core";
import { erroInfraAuth } from "../errosInfraAuth";
import { PrismaDb } from "../../tipos";

/**
 * Repositório de locatários para autenticação.
 *
 * Responsabilidades:
 * - validar existência do locatário;
 * - fornecer status (ativo/inativo).
 *
 * Uso:
 * - fluxo de login;
 * - validação de escopo de autenticação.
 */
export function createLocatariosRepositorioAuth(db: PrismaDb): LocatariosRepositorioAuth {
  return {
    /**
     * Busca um locatário pelo ID.
     *
     * @param params.locatarioId Identificador do locatário.
     * @returns `Ok(locatario)` ou `Ok(null)` se não existir.
     */
    async buscarPorId(params: { locatarioId: LocatarioId; }): Promise<Result<LocatarioAuth | null, ErroApp>> {
      try {
        const row = await db.locatarios.findUnique({
          where: {
            locatario_id: params.locatarioId,
          },
          select: {
            locatario_id: true,
          },
        });

        if (!row) {
          return wrapOk(null);
        }

        return wrapOk({
          locatarioId: row.locatario_id,
          status: "ATIVO"
        });
      } catch (causa) {
        return erroInfraAuth("Falha ao buscar locatário.", causa, {
          operacao: "auth.locatarios.buscarPorId",
          locatarioId: params.locatarioId,
        });
      }
    },
  };
}
