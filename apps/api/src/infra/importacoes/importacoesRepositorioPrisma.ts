// apps/api/src/infra/importacoes/importacoesRepositorioPrisma.ts

import { createErroApp, ImportacaoId, LocatarioId, wrapOk } from "@core-kit/core";
import { Prisma, PrismaClient } from "@prisma/client";

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
    mensagem: "Falha de infraestrutura em importações.",
    detalhes: { operacao, ...detalhes },
    causa,
  });
}

/**
 * 
 * @param prisma 
 * @returns 
 */
export function criarImportacoesRepositorioPrisma(prisma: PrismaClient | Prisma.TransactionClient) {
  return {
    async inserirImportacao(dados: {
      id: string;
      locatarioId: LocatarioId;
      tipo: string;
      status: string;
      arquivoOrigem: string;
    }) {
      try {
        const row = await prisma.importacoes.create({
          data: {
            locatario_id: dados.locatarioId,
            importacao_id: dados.id,
            tipo: dados.tipo,
            status: dados.status,
            arquivo_origem: dados.arquivoOrigem,
          },
        });

        return wrapOk(row);
      } catch (causa) {
        throw erroInfra(causa, "importacoes.inserirImportacao", dados);
      }
    },

    async inserirItem(dados: {
      locatarioId: LocatarioId;
      importacaoId: ImportacaoId;
      itemId: string;
      referencia: string;
      status: string;
      erro?: string | null;
    }) {
      try {
        const row = await prisma.itens_importacao.create({
          data: {
            locatario_id: dados.locatarioId,
            importacao_id: dados.importacaoId,
            item_importacao_id: dados.itemId,
            referencia: dados.referencia,
            status: dados.status,
            erro: dados.erro ?? null,
          },
        });

        return wrapOk(row);
      } catch (causa) {
        throw erroInfra(causa, "importacoes.inserirItem", dados);
      }
    },

    async listarItens(locatarioId: LocatarioId, importacaoId: ImportacaoId) {
      try {
        const rows = await prisma.itens_importacao.findMany({
          where: {
            locatario_id: locatarioId,
            importacao_id: importacaoId,
          },
          orderBy: { item_importacao_id: "asc" },
        });

        return wrapOk(rows);
      } catch (causa) {
        throw erroInfra(causa, "importacoes.listarItens", { locatarioId, importacaoId });
      }
    },
  };
}
