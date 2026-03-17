// backend/src/test/fixtures/usuarios.ts
import { prismaTest } from "../prismaTestClient";

export async function criarUsuarioFixture(params?: {
  locatarioId?: string;
  usuarioId?: string;
  nome?: string;
  email?: string;
  senhaHash?: string;
  ativo?: boolean;
}) {
  return prismaTest.usuarios.create({
    data: {
      locatario_id:
        params?.locatarioId ?? "11111111-1111-1111-1111-111111111111",
      usuario_id:
        params?.usuarioId ?? "22222222-2222-2222-2222-222222222222",
      nome: params?.nome ?? "Usuário Teste",
      email: params?.email ?? "teste@example.com",
      senha_hash: params?.senhaHash ?? "hash-teste",
      ativo: params?.ativo ?? true,
    },
  });
}