// apps/api/src/infra/backups/backupsInfraPrisma.ts

import { BackupId, LocatarioId } from "@core-kit/core";
import { PrismaClient } from "@prisma/client";
import { criarExportacoesRepositorioPrisma } from "../exportacoes/exportacoesRepositorioPrisma";
import { criarImportacoesRepositorioPrisma } from "../importacoes/importacoesRepositorioPrisma";

/**
 * 
 * @param prisma 
 * @returns 
 */
export function criarBackupsInfraPrisma(prisma: PrismaClient) {
  return {
    async solicitarBackup(params: {
      locatarioId: LocatarioId;
      backupId: BackupId;
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
      locatarioId: LocatarioId;
      restauracaoId: BackupId;
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
