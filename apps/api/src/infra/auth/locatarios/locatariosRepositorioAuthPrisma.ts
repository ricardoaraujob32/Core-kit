// apps/api/src/infra/auth/locatarios/locatariosRepositorioAuthPrisma.ts

import { ErroApp, LocatarioId, Result, wrapOk } from "@core-kit/core";
import { erroInfraAuth } from "../compartilhado/errosInfraAuth";
import { PrismaDb } from "../../prisma/tipos";

/**
 * 
 */
type LocatarioAuth = {
  locatarioId: LocatarioId;
  status: "ATIVO" | "INATIVO";
};

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
export function createLocatariosRepositorioAuthPrisma(db: PrismaDb) {
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
            ativo: true,
          },
        });

        if (!row) {
          return wrapOk(null);
        }

        return wrapOk({
          locatarioId: row.locatario_id,
          status: row.ativo ? "ATIVO" : "INATIVO",
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
