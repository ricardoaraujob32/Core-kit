// backend/src/usuarios/__tests__/usuariosRepositorioPrisma.int.spec.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { criarUsuariosRepositorioPrisma } from "../infra/usuariosRepositorioPrisma";

const prisma = new PrismaClient();

describe("usuariosRepositorioPrisma", () => {
  const repo = criarUsuariosRepositorioPrisma(prisma);

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
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

  it("deve inserir e buscar usuário por id", async () => {
    const inserido = await repo.inserir({
      id: "22222222-2222-2222-2222-222222222222",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      nome: "Ricardo",
      email: "ricardo@example.com",
      senhaHash: "hash",
      ativo: true,
    });

    expect(inserido.ok).toBe(true);

    const buscado = await repo.buscarPorId(
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222"
    );

    expect(buscado.ok).toBe(true);
    if (buscado.ok) {
      expect(buscado.value?.email).toBe("ricardo@example.com");
    }
  });

  it("deve listar usuários do locatário", async () => {
    await repo.inserir({
      id: "22222222-2222-2222-2222-222222222222",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      nome: "A",
      email: "a@example.com",
      senhaHash: "hash-a",
    });

    await repo.inserir({
      id: "33333333-3333-3333-3333-333333333333",
      locatarioId: "11111111-1111-1111-1111-111111111111",
      nome: "B",
      email: "b@example.com",
      senhaHash: "hash-b",
    });

    const resultado = await repo.listarPorLocatario(
      "11111111-1111-1111-1111-111111111111"
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value).toHaveLength(2);
    }
  });
});