// backend/src/assinaturas/__tests__/assinaturasRepositorioPrisma.int.spec.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { criarAssinaturasRepositorioPrisma } from "../infra/assinaturasRepositorioPrisma";

const prisma = new PrismaClient();

describe("assinaturasRepositorioPrisma", () => {
  const repo = criarAssinaturasRepositorioPrisma(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.assinaturas.deleteMany();
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

  it("deve inserir e buscar assinatura ativa", async () => {
    await repo.inserir({
      id: "22222222-2222-2222-2222-222222222222",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      planoCodigo: "BASICO",
      status: "ATIVA",
      iniciadoEm: new Date("2026-03-15T00:00:00.000Z"),
    });

    const resultado = await repo.buscarAtivaPorLocatario(
      "11111111-1111-1111-1111-111111111111"
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value?.planoCodigo).toBe("BASICO");
    }
  });

  it("deve atualizar status da assinatura", async () => {
    await repo.inserir({
      id: "22222222-2222-2222-2222-222222222222",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      planoCodigo: "BASICO",
      status: "ATIVA",
      iniciadoEm: new Date("2026-03-15T00:00:00.000Z"),
    });

    const resultado = await repo.atualizarStatus(
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222",
      "SUSPENSA",
      new Date("2026-03-20T00:00:00.000Z")
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.status).toBe("SUSPENSA");
    }
  });
});