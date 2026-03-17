// backend/src/auth/__tests__/authTransacaoPrisma.int.spec.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { criarAuthInfraPrisma } from "../infra/authTransacaoPrisma";

const prisma = new PrismaClient();

describe("authInfraPrisma", () => {
  const authInfra = criarAuthInfraPrisma(prisma);

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
  });

  it("deve persistir usuário e token na mesma transação", async () => {
    await authInfra.emTransacao(async ({ usuariosRepo, tokensRepo }) => {
      await usuariosRepo.inserir({
        id: "22222222-2222-2222-2222-222222222222",
        locatarioId: "11111111-1111-1111-1111-111111111111",
        nome: "Ricardo",
        email: "ricardo@example.com",
        senhaHash: "hash",
      });

      await tokensRepo.inserir({
        id: "33333333-3333-3333-3333-333333333333",
        locatarioId: "11111111-1111-1111-1111-111111111111",
        usuarioId: "22222222-2222-2222-2222-222222222222",
        tokenHash: "token-hash",
        expiraEm: new Date("2026-12-31T00:00:00.000Z"),
      });
    });

    const usuario = await prisma.usuarios.findFirst({
      where: { email: "ricardo@example.com" },
    });
    const token = await prisma.tokens.findFirst({
      where: { token_hash: "token-hash" },
    });

    expect(usuario).not.toBeNull();
    expect(token).not.toBeNull();
  });
});