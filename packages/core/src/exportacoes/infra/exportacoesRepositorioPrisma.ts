function mapExportacao(row: {
  locatario_id: string;
  exportacao_id: string;
  tipo: string;
  status: string;
  arquivo_url: string | null;
  erro: string | null;
  criado_em: Date;
  atualizado_em: Date;
}) {
  return {
    id: row.exportacao_id,
    locatarioId: row.locatario_id,
    tipo: row.tipo,
    status: row.status,
    arquivoUrl: row.arquivo_url,
    erro: row.erro,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

function erroInfra(causa: unknown, operacao: string, detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "ERRO_INTERNO",
    mensagem: "Falha de infraestrutura em exportações.",
    detalhes: { operacao, ...detalhes },
    causa,
  });
}

export function criarExportacoesRepositorioPrisma(
  prisma: PrismaClient | Prisma.TransactionClient
) {
  return {
    async inserir(dados: {
      id: string;
      locatarioId: string;
      tipo: string;
      status: string;
    }) {
      try {
        const row = await prisma.exportacoes.create({
          data: {
            locatario_id: dados.locatarioId,
            exportacao_id: dados.id,
            tipo: dados.tipo,
            status: dados.status,
          },
        });

        return wrapOk(mapExportacao(row));
      } catch (causa) {
        throw erroInfra(causa, "exportacoes.inserir", dados);
      }
    },

    async listarPorLocatario(locatarioId: string) {
      try {
        const rows = await prisma.exportacoes.findMany({
          where: { locatario_id: locatarioId },
          orderBy: { criado_em: "desc" },
        });

        return wrapOk(rows.map(mapExportacao));
      } catch (causa) {
        throw erroInfra(causa, "exportacoes.listarPorLocatario", { locatarioId });
      }
    },

    async atualizarStatus(
      locatarioId: string,
      exportacaoId: string,
      dados: { status: string; arquivoUrl?: string | null; erro?: string | null }
    ) {
      try {
        const row = await prisma.exportacoes.update({
          where: {
            locatario_id_exportacao_id: {
              locatario_id: locatarioId,
              exportacao_id: exportacaoId,
            },
          },
          data: {
            status: dados.status,
            arquivo_url: dados.arquivoUrl,
            erro: dados.erro,
          },
        });

        return wrapOk(mapExportacao(row));
      } catch (causa) {
        throw erroInfra(causa, "exportacoes.atualizarStatus", {
          locatarioId,
          exportacaoId,
          ...dados,
        });
      }
    },
  };
}