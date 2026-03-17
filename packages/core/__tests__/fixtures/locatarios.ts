// backend/src/test/fixtures/locatarios.ts
import { prismaTest } from "../prismaTestClient";

export async function criarLocatarioFixture(params?: {
  locatarioId?: string;
  nome?: string;
  slug?: string;
  ativo?: boolean;
}) {
  return prismaTest.locatarios.create({
    data: {
      locatario_id:
        params?.locatarioId ?? "11111111-1111-1111-1111-111111111111",
      nome: params?.nome ?? "Tenant A",
      slug: params?.slug ?? "tenant-a",
      ativo: params?.ativo ?? true,
    },
  });
}