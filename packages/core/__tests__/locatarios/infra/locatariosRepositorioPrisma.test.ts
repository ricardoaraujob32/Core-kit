// packages/backend/src/locatarios/__tests__/locatariosRepositorioPrisma.int.spec.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { criarLocatariosRepositorioPrisma } from "../infra/locatariosRepositorioPrisma";

const prisma = new PrismaClient();

describe("locatariosRepositorioPrisma", () => {
  const repo = criarLocatariosRepositorioPrisma(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.locatarios.deleteMany();
  });

  it("deve inserir e buscar por id", async () => {
    const insercao = await repo.inserir({
      id: "loc_001",
      nome: "Empresa Exemplo",
      slug: "empresa-exemplo",
      ativo: true,
    });

    expect(insercao.ok).toBe(true);

    const buscado = await repo.buscarPorId("loc_001");
    expect(buscado.ok).toBe(true);

    if (buscado.ok) {
      expect(buscado.value?.slug).toBe("empresa-exemplo");
    }
  });

  it("deve listar locatários", async () => {
    await repo.inserir({
      id: "loc_001",
      nome: "Empresa A",
      slug: "empresa-a",
      ativo: true,
    });

    await repo.inserir({
      id: "loc_002",
      nome: "Empresa B",
      slug: "empresa-b",
      ativo: true,
    });

    const resultado = await repo.listar();

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value).toHaveLength(2);
    }
  });
});