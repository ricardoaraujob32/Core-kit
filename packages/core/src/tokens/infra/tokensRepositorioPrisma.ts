function mapToken(row: {
  locatario_id: string;
  token_id: string;
  usuario_id: string;
  token_hash: string;
  expira_em: Date;
  revogado_em: Date | null;
  criado_em: Date;
}) {
  return {
    id: row.token_id,
    locatarioId: row.locatario_id,
    usuarioId: row.usuario_id,
    tokenHash: row.token_hash,
    expiraEm: row.expira_em,
    revogadoEm: row.revogado_em,
    criadoEm: row.criado_em,
  };
}

function erroInfra(causa: unknown, operacao: string, detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "ERRO_INTERNO",
    mensagem: "Falha de infraestrutura em tokens.",
    detalhes: { operacao, ...detalhes },
    causa,
  });
}

export function criarTokensRepositorioPrisma(
  prisma: PrismaClient | Prisma.TransactionClient
) {
  return {
    async inserir(dados: {
      id: string;
      locatarioId: string;
      usuarioId: string;
      tokenHash: string;
      expiraEm: Date;
    }) {
      try {
        const row = await prisma.tokens.create({
          data: {
            locatario_id: dados.locatarioId,
            token_id: dados.id,
            usuario_id: dados.usuarioId,
            token_hash: dados.tokenHash,
            expira_em: dados.expiraEm,
          },
        });

        return wrapOk(mapToken(row));
      } catch (causa) {
        throw erroInfra(causa, "tokens.inserir", {
          locatarioId: dados.locatarioId,
          usuarioId: dados.usuarioId,
        });
      }
    },

    async buscarPorId(locatarioId: string, tokenId: string) {
      try {
        const row = await prisma.tokens.findUnique({
          where: {
            locatario_id_token_id: {
              locatario_id: locatarioId,
              token_id: tokenId,
            },
          },
        });

        return wrapOk(row ? mapToken(row) : null);
      } catch (causa) {
        throw erroInfra(causa, "tokens.buscarPorId", { locatarioId, tokenId });
      }
    },

    async revogar(locatarioId: string, tokenId: string, revogadoEm: Date) {
      try {
        const row = await prisma.tokens.update({
          where: {
            locatario_id_token_id: {
              locatario_id: locatarioId,
              token_id: tokenId,
            },
          },
          data: {
            revogado_em: revogadoEm,
          },
        });

        return wrapOk(mapToken(row));
      } catch (causa) {
        throw erroInfra(causa, "tokens.revogar", { locatarioId, tokenId });
      }
    },
  };
}