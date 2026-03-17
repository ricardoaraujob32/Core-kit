// backend/src/exportacoes/__tests__/exportacoesRepositorioPrisma.int.spec.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { criarExportacoesRepositorioPrisma } from "../infra/exportacoesRepositorioPrisma";

const prisma = new PrismaClient();

describe("exportacoesRepositorioPrisma", () => {
  const repo = criarExportacoesRepositorioPrisma(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
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

  it("deve inserir e listar exportações", async () => {
    await repo.inserir({
      id: "22222222-2222-2222-2222-222222222222",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      tipo: "BACKUP_COMPLETO",
      status: "SOLICITADA",
    });

    const resultado = await repo.listarPorLocatario(
      "11111111-1111-1111-1111-111111111111"
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value).toHaveLength(1);
    }
  });

  it("deve atualizar status para concluída", async () => {
    await repo.inserir({
      id: "22222222-2222-2222-2222-222222222222",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      tipo: "BACKUP_COMPLETO",
      status: "SOLICITADA",
    });

    const resultado = await repo.atualizarStatus(
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222",
      {
        status: "CONCLUIDA",
        arquivoUrl: "s3://bucket/backup.zip",
      }
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.status).toBe("CONCLUIDA");
      expect(resultado.value.arquivoUrl).toBe("s3://bucket/backup.zip");
    }
  });
});