// apps/api/src/infra/modulos/modulosHabilitadosRepositorioPrisma.ts

import { ErroApp, erroRepositorioModulos, LocatarioId, ModuloHabilitado, ModulosHabilitadosRepositorio, Result, wrapOk } from "@core-kit/core";

/**
 * 
 */
type PrismaLike = {
  $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>;
};

/**
 * 
 */
type RowModuloHabilitado = {
  codigo: string;
  origem: "SISTEMA" | "PLANO" | "MANUAL";
};
/**
 * 
 * @param prisma 
 * @returns 
 */
export function criarModulosHabilitadosRepositorioPrisma(prisma: PrismaLike): ModulosHabilitadosRepositorio {
  return {
    async listarPorLocatario(locatarioId: LocatarioId): Promise<Result<ModuloHabilitado[], ErroApp>> {
      try {
        const rows = await prisma.$queryRaw<RowModuloHabilitado[]>`
          SELECT codigo, origem
          FROM vw_modulos_habilitados_locatario
          WHERE locatario_id = ${locatarioId}
          ORDER BY codigo ASC
        `;

        return wrapOk(
          rows.map((row) => ({
            codigo: row.codigo.toUpperCase(),
            origem: row.origem,
          })),
        );
      } catch (error) {
        return erroRepositorioModulos(error);
      }
    },
  };
}
