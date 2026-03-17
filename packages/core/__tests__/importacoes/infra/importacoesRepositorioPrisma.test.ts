// backend/src/importacoes/__tests__/importacoesRepositorioPrisma.int.spec.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { criarImportacoesRepositorioPrisma } from "../infra/importacoesRepositorioPrisma";

const prisma = new PrismaClient();

describe("importacoesRepositorioPrisma", () => {
  const repo = criarImportacoesRepositorioPrisma(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.itens_importacao.deleteMany();
    await prisma.importacoes.deleteMany();
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

  it("deve inserir importação e item", async () => {
    await repo.inserirImportacao({
      id: "22222222-2222-2222-2222-222222222222",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      tipo: "RESTAURACAO",
      status: "SOLICITADA",
      arquivoOrigem: "s3://bucket/import.zip",
    });

    const item = await repo.inserirItem({
      locatarioId: "11111111-1111-1111-1111-111111111111",
      importacaoId: "22222222-2222-2222-2222-222222222222",
      itemId: "33333333-3333-3333-3333-333333333333",
      referencia: "usuarios.csv",
      status: "PENDENTE",
    });

    expect(item.ok).toBe(true);
  });

  it("deve listar itens da importação", async () => {
    await repo.inserirImportacao({
      id: "22222222-2222-2222-2222-222222222222",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      tipo: "RESTAURACAO",
      status: "SOLICITADA",
      arquivoOrigem: "s3://bucket/import.zip",
    });

    await repo.inserirItem({
      locatarioId: "11111111-1111-1111-1111-111111111111",
      importacaoId: "22222222-2222-2222-2222-222222222222",
      itemId: "33333333-3333-3333-3333-333333333333",
      referencia: "usuarios.csv",
      status: "PENDENTE",
    });

    const resultado = await repo.listarItens(
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222"
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value).toHaveLength(1);
    }
  });
});