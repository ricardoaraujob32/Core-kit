// // apps/api/src/infra/assinaturas/assinaturasRepositorioPrisma.ts

import type { Assinatura, AssinaturaId, AssinaturasRepositorio, LocatarioId, RegistrarAssinaturaParams } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import type { status_assinatura } from "@prisma/client";
import { mapearErroInfra } from "../erros";

type AssinaturaRow = {
  assinatura_id: string;
  locatario_id: string;
  plano_id: string;
  status: string;
  inicio_em: Date;
  fim_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
};

function mapAssinatura(row: AssinaturaRow): Assinatura {
  return {
    assinaturaId: row.assinatura_id,
    locatarioId: row.locatario_id,
    planoId: row.plano_id,
    status: row.status as Assinatura["status"],
    iniciadaEm: row.inicio_em,
    encerradaEm: row.fim_em,
    criadaEm: row.criado_em,
    atualizadaEm: row.atualizado_em,
  };
}

function mapStatusAssinaturaParaPersistencia(status: Assinatura["status"]): status_assinatura {
  switch (status) {
    case "RASCUNHO":
      return "RASCUNHO";
    case "ATIVA":
      return "ATIVA";
    case "SUSPENSA":
      return "SUSPENSA";
    case "CANCELADA":
      return "CANCELADA";
    case "ENCERRADA":
      return "CANCELADA";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function createAssinaturasRepositorioPrisma(db: PrismaDb): AssinaturasRepositorio {
  return {
    async criarAssinatura(params: RegistrarAssinaturaParams) {
      try {
        const assinatura = await db.assinaturas.create({
          data: {
            assinatura_id: params.assinaturaId,
            locatario_id: params.locatarioId,
            plano_id: params.planoId,
            status: mapStatusAssinaturaParaPersistencia(params.status),
            inicio_em: params.iniciadaEm,
            fim_em: params.encerradaEm ?? null,
            criado_em: params.criadaEm,
            atualizado_em: params.atualizadaEm,
          },
          select: {
            assinatura_id: true,
            locatario_id: true,
            plano_id: true,
            status: true,
            inicio_em: true,
            fim_em: true,
            criado_em: true,
            atualizado_em: true,
          },
        });

        return wrapOk(mapAssinatura(assinatura));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "assinaturas",
          operacao: "infra.prisma.assinaturas.criarAssinatura",
          detalhes: { locatarioId: params.locatarioId, planoId: params.planoId },
        });
      }
    },

    async atualizarAssinatura(assinatura: Assinatura) {
      try {
        const atualizada = await db.assinaturas.update({
          where: {
            locatario_id_assinatura_id: {
              locatario_id: assinatura.locatarioId,
              assinatura_id: assinatura.assinaturaId,
            },
          },
          data: {
            plano_id: assinatura.planoId,
            status: mapStatusAssinaturaParaPersistencia(assinatura.status),
            inicio_em: assinatura.iniciadaEm,
            fim_em: assinatura.encerradaEm,
            atualizado_em: assinatura.atualizadaEm,
          },
          select: {
            assinatura_id: true,
            locatario_id: true,
            plano_id: true,
            status: true,
            inicio_em: true,
            fim_em: true,
            criado_em: true,
            atualizado_em: true,
          },
        });

        return wrapOk(mapAssinatura(atualizada));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "assinaturas",
          operacao: "infra.prisma.assinaturas.atualizarAssinatura",
          detalhes: { assinaturaId: assinatura.assinaturaId, locatarioId: assinatura.locatarioId },
        });
      }
    },

    async buscarPorId(assinaturaId: AssinaturaId) {
      try {
        const assinatura = await db.assinaturas.findFirst({
          where: { assinatura_id: assinaturaId, excluido_em: null },
          select: {
            assinatura_id: true,
            locatario_id: true,
            plano_id: true,
            status: true,
            inicio_em: true,
            fim_em: true,
            criado_em: true,
            atualizado_em: true,
          },
        });

        return wrapOk(assinatura ? mapAssinatura(assinatura) : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "assinaturas",
          operacao: "infra.prisma.assinaturas.buscarPorId",
          detalhes: { assinaturaId },
        });
      }
    },

    async buscarAssinaturaAtivaPorLocatario(locatarioId: LocatarioId) {
      try {
        const assinatura = await db.assinaturas.findFirst({
          where: { locatario_id: locatarioId, status: "ATIVA", excluido_em: null },
          orderBy: { criado_em: "desc" },
          select: {
            assinatura_id: true,
            locatario_id: true,
            plano_id: true,
            status: true,
            inicio_em: true,
            fim_em: true,
            criado_em: true,
            atualizado_em: true,
          },
        });

        return wrapOk(assinatura ? mapAssinatura(assinatura) : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "assinaturas",
          operacao: "infra.prisma.assinaturas.buscarAssinaturaAtivaPorLocatario",
          detalhes: { locatarioId },
        });
      }
    },
  };
}
