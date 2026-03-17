// backend/src/infra/prisma/transaction.ts
import type { Prisma, PrismaClient } from "@prisma/client";

export type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

export async function executarEmTransacao<T>(
  prisma: PrismaClient,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => fn(tx));
}