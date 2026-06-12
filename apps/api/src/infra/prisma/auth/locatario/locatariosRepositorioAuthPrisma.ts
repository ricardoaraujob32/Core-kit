// apps/api/src/infra/prisma/auth/locatarios/locatariosRepositorioAuthPrisma.ts

import { ErroApp, LocatarioAuth, LocatarioSlug, LocatariosRepositorioAuth, Result, wrapOk } from "@core-kit/core";
import { erroInfraAuth } from "../errosInfraAuth.js";
import { PrismaDb } from "../../tipos.js";

/**
 * Repositório de locatários para autenticação.
 *
 * Responsabilidades:
 * - localizar o locatário pelo slug informado no login;
 * - devolver apenas a projeção mínima necessária ao fluxo de auth;
 * - adaptar o status persistido no banco para o contrato do Core.
 */
export function createLocatariosRepositorioAuth(db: PrismaDb): LocatariosRepositorioAuth {
  return {
    /**
     * Busca um locatário pelo slug.
     *
     * Observação:
     * usa `findFirst` porque o schema Prisma atual expõe `slug` sem contrato
     * local de unicidade no model enviado. Se depois o schema formalizar
     * unicidade em `slug`, este método pode migrar para `findUnique`.
     *
     * @param params.locatarioSlug Slug público do locatário.
     * @returns `Ok(locatario)` quando encontrado, ou `Ok(null)` quando ausente.
     */
    async buscarPorSlug(params: { locatarioSlug: LocatarioSlug; }): Promise<Result<LocatarioAuth | null, ErroApp>> {
      try {
        const row = await db.locatarios.findFirst({
          where: {
            slug: params.locatarioSlug,
          },
          select: {
            locatario_id: true,
            status: true,
          },
        });

        if (!row) {
          return wrapOk(null);
        }

        return wrapOk({
          locatarioId: row.locatario_id,
          status: row.status,
        });
      } catch (causa) {
        return erroInfraAuth({
          mensagem:"Falha ao buscar locatário por slug.",  
          operacao: "auth.locatarios.buscarPorSlug",
          causa,
          detalhes: {locatarioSlug: params.locatarioSlug,}
        });
      }
    },
  };
}
