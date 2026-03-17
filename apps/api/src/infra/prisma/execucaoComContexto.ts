import type { PrismaClient } from "@prisma/client";

export interface ContextoBanco {
  usuarioId: string;
  locatarioId: string | null;
  isPlataforma: boolean;
}

export async function executarComContexto<T>(
  prisma: PrismaClient,
  contexto: ContextoBanco,
  fn: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SELECT app_definir_contexto($1::uuid, $2::uuid, $3::boolean)`,
      contexto.usuarioId,
      contexto.locatarioId,
      contexto.isPlataforma,
    );

    return fn(tx as PrismaClient);
  });
}