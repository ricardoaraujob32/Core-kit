// apps/api/src/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.ts

import type { AssinaturaId, AssinaturasModulosRepositorio, ModuloHabilitadoAssinatura, ModuloId, RegistrarModuloAssinaturaParams } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";

type ModuloLocatarioRow = {
  modulo_id: string;
  origem: string;
  habilitado: boolean;
  criado_em: Date;
  atualizado_em: Date;
};

function mapOrigemAssinatura(origem: string): ModuloHabilitadoAssinatura["origem"] {
  const normalizada = origem.trim().toUpperCase();

  if (normalizada === "GRATUITO" || normalizada === "CORTESIA") {
    return "GRATUITO";
  }

  return "ASSINATURA";
}

function mapModuloAssinatura(
  assinaturaId: AssinaturaId,
  row: ModuloLocatarioRow,
): ModuloHabilitadoAssinatura {
  return {
    assinaturaId,
    moduloId: row.modulo_id,
    gratuito: mapOrigemAssinatura(row.origem) === "GRATUITO",
    origem: mapOrigemAssinatura(row.origem),
    habilitadoEm: row.criado_em,
    desabilitadoEm: row.habilitado ? null : row.atualizado_em,
  };
}

export function createAssinaturasModulosRepositorioPrisma(
  db: PrismaDb,
): AssinaturasModulosRepositorio {
  return {
    async vincularModulo(params: RegistrarModuloAssinaturaParams) {
      try {
        const assinatura = await db.assinaturas.findFirst({
          where: { assinatura_id: params.assinaturaId, excluido_em: null },
          select: { locatario_id: true },
        });

        if (!assinatura) {
          return mapearErroInfra(new Error("Assinatura não encontrada"), {
            entidade: "modulos_locatario",
            operacao: "infra.prisma.assinaturasModulos.vincularModulo.assinaturaAusente",
            detalhes: { assinaturaId: params.assinaturaId },
          });
        }

        const rows = await db.$queryRaw<ModuloLocatarioRow[]>`
          INSERT INTO core.modulos_locatario (
            locatario_id,
            modulo_id,
            habilitado,
            origem,
            criado_em,
            atualizado_em
          )
          VALUES (
            ${assinatura.locatario_id}::uuid,
            ${params.moduloId}::uuid,
            true,
            'MANUAL_SUPERADMIN'::core.origem_modulo_assinatura,
            ${params.habilitadoEm},
            ${params.habilitadoEm}
          )
          ON CONFLICT (locatario_id, modulo_id)
          DO UPDATE SET
            habilitado = true,
            origem = 'MANUAL_SUPERADMIN'::core.origem_modulo_assinatura,
            atualizado_em = ${params.habilitadoEm}
          RETURNING
            modulo_id,
            origem::text AS origem,
            habilitado,
            criado_em,
            atualizado_em
        `;

        const vinculo = rows[0];

        if (!vinculo) {
          return mapearErroInfra(new Error("Falha ao vincular módulo ao locatário"), {
            entidade: "modulos_locatario",
            operacao: "infra.prisma.assinaturasModulos.vincularModulo.semRetorno",
            detalhes: { assinaturaId: params.assinaturaId, moduloId: params.moduloId },
          });
        }

        return wrapOk(mapModuloAssinatura(params.assinaturaId, vinculo));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos_locatario",
          operacao: "infra.prisma.assinaturasModulos.vincularModulo",
          detalhes: { assinaturaId: params.assinaturaId, moduloId: params.moduloId },
        });
      }
    },

    async desvincularModulo(
      assinaturaId: AssinaturaId,
      moduloId: ModuloId,
      desabilitadoEm: Date,
    ) {
      try {
        const assinatura = await db.assinaturas.findFirst({
          where: { assinatura_id: assinaturaId, excluido_em: null },
          select: { locatario_id: true },
        });

        if (!assinatura) return wrapOk(undefined);

        await db.$executeRaw`
          UPDATE core.modulos_locatario
          SET
            habilitado = false,
            atualizado_em = ${desabilitadoEm}
          WHERE locatario_id = ${assinatura.locatario_id}::uuid
            AND modulo_id = ${moduloId}::uuid
        `;

        return wrapOk(undefined);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos_locatario",
          operacao: "infra.prisma.assinaturasModulos.desvincularModulo",
          detalhes: { assinaturaId, moduloId },
        });
      }
    },

    async buscarModuloVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId) {
      try {
        const assinatura = await db.assinaturas.findFirst({
          where: { assinatura_id: assinaturaId, excluido_em: null },
          select: { locatario_id: true },
        });

        if (!assinatura) return wrapOk(null);

        const rows = await db.$queryRaw<ModuloLocatarioRow[]>`
          SELECT
            modulo_id,
            origem::text AS origem,
            habilitado,
            criado_em,
            atualizado_em
          FROM core.modulos_locatario
          WHERE locatario_id = ${assinatura.locatario_id}::uuid
            AND modulo_id = ${moduloId}::uuid
          LIMIT 1
        `;

        const vinculo = rows[0] ?? null;

        return wrapOk(vinculo ? mapModuloAssinatura(assinaturaId, vinculo) : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos_locatario",
          operacao: "infra.prisma.assinaturasModulos.buscarModuloVinculado",
          detalhes: { assinaturaId, moduloId },
        });
      }
    },

    async listarModulosAtivosDaAssinatura(assinaturaId: AssinaturaId) {
      try {
        const assinatura = await db.assinaturas.findFirst({
          where: { assinatura_id: assinaturaId, excluido_em: null },
          select: { locatario_id: true },
        });

        if (!assinatura) return wrapOk([]);

        const vinculos = await db.$queryRaw<ModuloLocatarioRow[]>`
          SELECT
            modulo_id,
            origem::text AS origem,
            habilitado,
            criado_em,
            atualizado_em
          FROM core.modulos_locatario
          WHERE locatario_id = ${assinatura.locatario_id}::uuid
            AND habilitado = true
          ORDER BY modulo_id ASC
        `;

        return wrapOk(vinculos.map((row) => mapModuloAssinatura(assinaturaId, row)));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos_locatario",
          operacao: "infra.prisma.assinaturasModulos.listarModulosAtivosDaAssinatura",
          detalhes: { assinaturaId },
        });
      }
    },
  };
}