export function criarBackupsInfraPrisma(prisma: PrismaClient) {
  return {
    async solicitarBackup(params: {
      locatarioId: string;
      backupId: string;
      tipo: string;
    }) {
      const exportacoesRepo = criarExportacoesRepositorioPrisma(prisma);

      return exportacoesRepo.inserir({
        id: params.backupId,
        locatarioId: params.locatarioId,
        tipo: params.tipo,
        status: "SOLICITADA",
      });
    },

    async solicitarRestauracao(params: {
      locatarioId: string;
      restauracaoId: string;
      tipo: string;
      arquivoOrigem: string;
    }) {
      const importacoesRepo = criarImportacoesRepositorioPrisma(prisma);

      return importacoesRepo.inserirImportacao({
        id: params.restauracaoId,
        locatarioId: params.locatarioId,
        tipo: params.tipo,
        status: "SOLICITADA",
        arquivoOrigem: params.arquivoOrigem,
      });
    },
  };
}