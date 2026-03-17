function erroInfra(causa: unknown, operacao: string, detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "ERRO_INTERNO",
    mensagem: "Falha de infraestrutura em RBAC.",
    detalhes: { operacao, ...detalhes },
    causa,
  });
}

export function criarPermissoesRepositorioPrisma(
  prisma: PrismaClient | Prisma.TransactionClient
) {
  return {
    async listarPorUsuario(locatarioId: string, usuarioId: string) {
      try {
        const rows = await prisma.usuarios_permissoes.findMany({
          where: {
            locatario_id: locatarioId,
            usuario_id: usuarioId,
          },
          orderBy: { permissao: "asc" },
        });

        return wrapOk(rows.map((r) => r.permissao));
      } catch (causa) {
        throw erroInfra(causa, "rbac.listarPermissoesPorUsuario", {
          locatarioId,
          usuarioId,
        });
      }
    },
  };
}