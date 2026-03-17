// backend/src/tokens/__tests__/tokensRepositorioPrisma.int.spec.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { criarTokensRepositorioPrisma } from "../infra/tokensRepositorioPrisma";

const prisma = new PrismaClient();

describe("tokensRepositorioPrisma", () => {
  const repo = criarTokensRepositorioPrisma(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.tokens.deleteMany();
    await prisma.usuarios.deleteMany();
    await prisma.locatarios.deleteMany();

    await prisma.locatarios.create({
      data: {
        locatario_id: "11111111-1111-1111-1111-111111111111",
        nome: "Tenant A",
        slug: "tenant-a",
        ativo: true,
      },
    });

    await prisma.usuarios.create({
      data: {
        locatario_id: "11111111-1111-1111-1111-111111111111",
        usuario_id: "22222222-2222-2222-2222-222222222222",
        nome: "Ricardo",
        email: "ricardo@example.com",
        senha_hash: "hash",
        ativo: true,
      },
    });
  });

  it("deve inserir e buscar token", async () => {
    const expiraEm = new Date("2026-12-31T00:00:00.000Z");

    const inserido = await repo.inserir({
      id: "33333333-3333-3333-3333-333333333333",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      usuarioId: "22222222-2222-2222-2222-222222222222",
      tokenHash: "token-hash",
      expiraEm,
    });

    expect(inserido.ok).toBe(true);

    const buscado = await repo.buscarPorId(
      "11111111-1111-1111-1111-111111111111",
      "33333333-3333-3333-3333-333333333333"
    );

    expect(buscado.ok).toBe(true);
    if (buscado.ok) {
      expect(buscado.value?.tokenHash).toBe("token-hash");
    }
  });

  it("deve revogar token", async () => {
    await repo.inserir({
      id: "33333333-3333-3333-3333-333333333333",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      usuarioId: "22222222-2222-2222-2222-222222222222",
      tokenHash: "token-hash",
      expiraEm: new Date("2026-12-31T00:00:00.000Z"),
    });

    const atualizado = await repo.revogar(
      "11111111-1111-1111-1111-111111111111",
      "33333333-3333-3333-3333-333333333333",
      new Date("2026-03-15T12:00:00.000Z")
    );

    expect(atualizado.ok).toBe(true);
    if (atualizado.ok) {
      expect(atualizado.value.revogadoEm).not.toBeNull();
    }
  });
});