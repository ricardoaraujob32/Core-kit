// backend/src/rbac/__tests__/permissoesRepositorioPrisma.int.spec.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { criarPermissoesRepositorioPrisma } from "../infra/permissoesRepositorioPrisma";

const prisma = new PrismaClient();

describe("permissoesRepositorioPrisma", () => {
  const repo = criarPermissoesRepositorioPrisma(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.usuarios_permissoes.deleteMany();
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

  it("deve listar permissões do usuário", async () => {
    await prisma.usuarios_permissoes.createMany({
      data: [
        {
          locatario_id: "11111111-1111-1111-1111-111111111111",
          usuario_id: "22222222-2222-2222-2222-222222222222",
          permissao: "usuarios.ler",
        },
        {
          locatario_id: "11111111-1111-1111-1111-111111111111",
          usuario_id: "22222222-2222-2222-2222-222222222222",
          permissao: "usuarios.criar",
        },
      ],
    });

    const resultado = await repo.listarPorUsuario(
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222"
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value).toEqual(["usuarios.criar", "usuarios.ler"]);
    }
  });
});