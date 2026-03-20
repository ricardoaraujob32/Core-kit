//

import { AssinaturaId } from "../../assinaturas";
import { createErroApp, wrapOk } from "../../kernel";
import { LocatarioId } from "../../locatarios";

/**
 * 
 * @param row 
 * @returns 
 */
function mapAssinatura(row: {
  locatario_id: LocatarioId;
  assinatura_id: AssinaturaId;
  plano_codigo: string;
  status: string;
  iniciado_em: Date;
  encerrado_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}) {
  return {
    id: row.assinatura_id,
    locatarioId: row.locatario_id,
    planoCodigo: row.plano_codigo,
    status: row.status,
    iniciadoEm: row.iniciado_em,
    encerradoEm: row.encerrado_em,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

/**
 * 
 * @param causa 
 * @param operacao 
 * @param detalhes 
 * @returns 
 */
function erroInfra(causa: unknown, operacao: string, detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "ERRO_INTERNO",
    mensagem: "Falha de infraestrutura em assinaturas.",
    detalhes: { operacao, ...detalhes },
    causa,
  });
}

/**
 * 
 * @param prisma 
 * @returns 
 */
export function criarAssinaturasRepositorioPrisma(prisma: PrismaClient | Prisma.TransactionClient) {
  return {
    async inserir(dados: {
      id: string;
      locatarioId: LocatarioId;
      planoCodigo: string;
      status: string;
      iniciadoEm: Date;
      encerradoEm?: Date | null;
    }) {
      try {
        const row = await prisma.assinaturas.create({
          data: {
            locatario_id: dados.locatarioId,
            assinatura_id: dados.id,
            plano_codigo: dados.planoCodigo,
            status: dados.status,
            iniciado_em: dados.iniciadoEm,
            encerrado_em: dados.encerradoEm ?? null,
          },
        });

        return wrapOk(mapAssinatura(row));
      } catch (causa) {
        throw erroInfra(causa, "assinaturas.inserir", {
          locatarioId: dados.locatarioId,
          planoCodigo: dados.planoCodigo,
        });
      }
    },

    async buscarAtivaPorLocatario(locatarioId: string) {
      try {
        const row = await prisma.assinaturas.findFirst({
          where: {
            locatario_id: locatarioId,
            status: "ATIVA",
          },
          orderBy: { iniciado_em: "desc" },
        });

        return wrapOk(row ? mapAssinatura(row) : null);
      } catch (causa) {
        throw erroInfra(causa, "assinaturas.buscarAtivaPorLocatario", { locatarioId });
      }
    },

    async atualizarStatus(
      locatarioId: LocatarioId,
      assinaturaId: AssinaturaId,
      status: string,
      encerradoEm?: Date | null
    ) {
      try {
        const row = await prisma.assinaturas.update({
          where: {
            locatario_id_assinatura_id: {
              locatario_id: locatarioId,
              assinatura_id: assinaturaId,
            },
          },
          data: {
            status,
            encerrado_em: encerradoEm ?? undefined,
          },
        });

        return wrapOk(mapAssinatura(row));
      } catch (causa) {
        throw erroInfra(causa, "assinaturas.atualizarStatus", {
          locatarioId,
          assinaturaId,
          status,
        });
      }
    },
  };
}
