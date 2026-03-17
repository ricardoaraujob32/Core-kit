// backend/src/test/resetDatabase.ts
import { prismaTest } from "./prismaTestClient";

export async function resetDatabase() {
  await prismaTest.auditoria_locatario.deleteMany();
  await prismaTest.auditoria_plataforma.deleteMany();
  await prismaTest.itens_importacao.deleteMany();
  await prismaTest.importacoes.deleteMany();
  await prismaTest.exportacoes.deleteMany();
  await prismaTest.assinaturas.deleteMany();
  await prismaTest.tokens.deleteMany();
  await prismaTest.usuarios_permissoes.deleteMany();
  await prismaTest.usuarios.deleteMany();
  await prismaTest.locatarios.deleteMany();
}