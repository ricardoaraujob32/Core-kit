function mapUsuario(row: {
  locatario_id: string;
  usuario_id: string;
  nome: string;
  email: string;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}) {
  return {
    id: row.usuario_id,
    locatarioId: row.locatario_id,
    nome: row.nome,
    email: row.email,
    ativo: row.ativo,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

function mapInfraError(causa: unknown, operacao: string, detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "ERRO_INTERNO",
    mensagem: "Falha de infraestrutura em usuários.",
    detalhes: { operacao, ...detalhes },
    causa,
  });
}

export function criarUsuariosRepositorioPrisma(
  prisma: PrismaClient | Prisma.TransactionClient
) {
  return {
    async inserir(dados: {
      id: string;
      locatarioId: string;
      nome: string;
      email: string;
      senhaHash: string;
      ativo?: boolean;
    }) {
      try {
        const row = await prisma.usuarios.create({
          data: {
            locatario_id: dados.locatarioId,
            usuario_id: dados.id,
            nome: dados.nome,
            email: dados.email,
            senha_hash: dados.senhaHash,
            ativo: dados.ativo ?? true,
          },
        });

        return wrapOk(mapUsuario(row));
      } catch (causa) {
        throw mapInfraError(causa, "usuarios.inserir", {
          locatarioId: dados.locatarioId,
          email: dados.email,
        });
      }
    },

    async buscarPorId(locatarioId: string, id: string) {
      try {
        const row = await prisma.usuarios.findUnique({
          where: {
            locatario_id_usuario_id: {
              locatario_id: locatarioId,
              usuario_id: id,
            },
          },
        });

        return wrapOk(row ? mapUsuario(row) : null);
      } catch (causa) {
        throw mapInfraError(causa, "usuarios.buscarPorId", { locatarioId, id });
      }
    },

    async buscarPorEmail(locatarioId: string, email: string) {
      try {
        const row = await prisma.usuarios.findFirst({
          where: {
            locatario_id: locatarioId,
            email,
          },
        });

        return wrapOk(row ? mapUsuario(row) : null);
      } catch (causa) {
        throw mapInfraError(causa, "usuarios.buscarPorEmail", { locatarioId, email });
      }
    },

    async listarPorLocatario(locatarioId: string) {
      try {
        const rows = await prisma.usuarios.findMany({
          where: { locatario_id: locatarioId },
          orderBy: { criado_em: "asc" },
        });

        return wrapOk(rows.map(mapUsuario));
      } catch (causa) {
        throw mapInfraError(causa, "usuarios.listarPorLocatario", { locatarioId });
      }
    },
  };
}