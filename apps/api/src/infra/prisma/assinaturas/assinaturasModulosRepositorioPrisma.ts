// apps/api/src/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.ts

import type {
  AssinaturaId,
  AssinaturasModulosRepositorio,
  ModuloHabilitadoAssinatura,
  ModuloId,
  RegistrarModuloAssinaturaParams,
} from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";

type ModuloAssinaturaRow = {
  assinatura_id: string;
  modulo_id: string;
  origem: string;
  habilitado: boolean;
  criado_em: Date;
  atualizado_em: Date;
};

function mapModuloAssinatura(row: ModuloAssinaturaRow): ModuloHabilitadoAssinatura {
  return {
    assinaturaId: row.assinatura_id,
    moduloId: row.modulo_id,
    gratuito: false,
    origem: row.origem === "GRATUITO" ? "GRATUITO" : "ASSINATURA",
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
            entidade: "modulos_assinatura",
            operacao: "infra.prisma.assinaturasModulos.vincularModulo.assinaturaAusente",
            detalhes: { assinaturaId: params.assinaturaId },
          });
        }

        const vinculo = await db.modulos_assinatura.upsert({
          where: {
            locatario_id_assinatura_id_modulo_id: {
              locatario_id: assinatura.locatario_id,
              assinatura_id: params.assinaturaId,
              modulo_id: params.moduloId,
            },
          },
          create: {
            locatario_id: assinatura.locatario_id,
            assinatura_id: params.assinaturaId,
            modulo_id: params.moduloId,
            habilitado: true,
            origem: "MANUAL",
            criado_em: params.habilitadoEm,
            atualizado_em: params.habilitadoEm,
          },
          update: {
            habilitado: true,
            origem: "MANUAL",
            atualizado_em: params.habilitadoEm,
          },
          select: {
            assinatura_id: true,
            modulo_id: true,
            origem: true,
            habilitado: true,
            criado_em: true,
            atualizado_em: true,
          },
        });

        return wrapOk(mapModuloAssinatura(vinculo));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos_assinatura",
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

        await db.modulos_assinatura.update({
          where: {
            locatario_id_assinatura_id_modulo_id: {
              locatario_id: assinatura.locatario_id,
              assinatura_id: assinaturaId,
              modulo_id: moduloId,
            },
          },
          data: { habilitado: false, atualizado_em: desabilitadoEm },
        });

        return wrapOk(undefined);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos_assinatura",
          operacao: "infra.prisma.assinaturasModulos.desvincularModulo",
          detalhes: { assinaturaId, moduloId },
        });
      }
    },

    async buscarModuloVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId) {
      try {
        const vinculo = await db.modulos_assinatura.findFirst({
          where: { assinatura_id: assinaturaId, modulo_id: moduloId },
          select: {
            assinatura_id: true,
            modulo_id: true,
            origem: true,
            habilitado: true,
            criado_em: true,
            atualizado_em: true,
          },
        });

        return wrapOk(vinculo ? mapModuloAssinatura(vinculo) : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos_assinatura",
          operacao: "infra.prisma.assinaturasModulos.buscarModuloVinculado",
          detalhes: { assinaturaId, moduloId },
        });
      }
    },

    async listarModulosAtivosDaAssinatura(assinaturaId: AssinaturaId) {
      try {
        const vinculos = await db.modulos_assinatura.findMany({
          where: { assinatura_id: assinaturaId, habilitado: true },
          orderBy: { modulo_id: "asc" },
          select: {
            assinatura_id: true,
            modulo_id: true,
            origem: true,
            habilitado: true,
            criado_em: true,
            atualizado_em: true,
          },
        });

        return wrapOk(vinculos.map(mapModuloAssinatura));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "modulos_assinatura",
          operacao: "infra.prisma.assinaturasModulos.listarModulosAtivosDaAssinatura",
          detalhes: { assinaturaId },
        });
      }
    },
  };
}
