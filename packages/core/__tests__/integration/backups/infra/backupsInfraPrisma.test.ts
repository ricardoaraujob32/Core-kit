// backend/src/backups/__tests__/backupsInfraPrisma.int.spec.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { criarBackupsInfraPrisma } from "../infra/backupsInfraPrisma";

const prisma = new PrismaClient();

describe("backupsInfraPrisma", () => {
  const infra = criarBackupsInfraPrisma(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.itens_importacao.deleteMany();
    await prisma.importacoes.deleteMany();
    await prisma.exportacoes.deleteMany();
    await prisma.locatarios.deleteMany();

    await prisma.locatarios.create({
      data: {
        locatario_id: "11111111-1111-1111-1111-111111111111",
        nome: "Tenant A",
        slug: "tenant-a",
        ativo: true,
      },
    });
  });

  it("deve solicitar backup via exportações", async () => {
    const resultado = await infra.solicitarBackup({
      locatarioId: "11111111-1111-1111-1111-111111111111",
      backupId: "22222222-2222-2222-2222-222222222222",
      tipo: "BACKUP_COMPLETO",
    });

    expect(resultado.ok).toBe(true);

    const row = await prisma.exportacoes.findFirst({
      where: { exportacao_id: "22222222-2222-2222-2222-222222222222" },
    });

    expect(row).not.toBeNull();
  });

  it("deve solicitar restauração via importações", async () => {
    const resultado = await infra.solicitarRestauracao({
      locatarioId: "11111111-1111-1111-1111-111111111111",
      restauracaoId: "33333333-3333-3333-3333-333333333333",
      tipo: "RESTAURACAO_COMPLETA",
      arquivoOrigem: "s3://bucket/restore.zip",
    });

    expect(resultado.ok).toBe(true);

    const row = await prisma.importacoes.findFirst({
      where: { importacao_id: "33333333-3333-3333-3333-333333333333" },
    });

    expect(row).not.toBeNull();
  });
});