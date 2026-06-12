// apps/api/src/infra/modulos/modulosHabilitadosRepositorioPrisma.ts

import { ErroApp, erroRepositorioModulos, LocatarioId, ModuloHabilitado, ModulosHabilitadosRepositorio, Result, wrapOk } from "@core-kit/core";

type PrismaLike = {
  $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>;
};

type RowModuloHabilitado = {
  codigo: string;
  origem: "SISTEMA" | "PLANO" | "MANUAL" | "MANUAL_SUPERADMIN" | "PLANO_SUGERIDO" | "ADDON" | "CORTESIA";
};

function normalizarOrigem(origem: RowModuloHabilitado["origem"]): ModuloHabilitado["origem"] {
  switch (origem) {
    case "SISTEMA":
      return "SISTEMA";
    case "PLANO":
    case "PLANO_SUGERIDO":
      return "PLANO";
    case "MANUAL":
    case "MANUAL_SUPERADMIN":
    case "ADDON":
    case "CORTESIA":
    default:
      return "MANUAL";
  }
}

export function criarModulosHabilitadosRepositorioPrisma(
  prisma: PrismaLike,
): ModulosHabilitadosRepositorio {
  return {
    async listarPorLocatario(
      locatarioId: LocatarioId,
    ): Promise<Result<ModuloHabilitado[], ErroApp>> {
      try {
        const rows = await prisma.$queryRaw<RowModuloHabilitado[]>`
          SELECT
            m.codigo,
            ml.origem::text AS origem
          FROM core.modulos_locatario ml
          JOIN core.modulos m
            ON m.modulo_id = ml.modulo_id
          WHERE ml.locatario_id = ${locatarioId}::uuid
            AND ml.habilitado = true
            AND m.ativo = true
          ORDER BY m.codigo ASC
        `;

        return wrapOk(
          rows.map((row) => ({
            codigo: row.codigo.toUpperCase(),
            origem: normalizarOrigem(row.origem),
          })),
        );
      } catch (error) {
        return erroRepositorioModulos(error);
      }
    },
  };
}