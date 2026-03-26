// apps/api/src/infra/auth/TransacaoPorta.ts

import { TransacaoPorta } from "@core-kit/core";
import { PrismaClient } from "@prisma/client";

/**
 * Adapter Prisma -> TransacaoPorta do Core.
 *
 * Responsabilidade única:
 * - fornecer execução transacional compatível com o contrato do Core.
 *
 * Observações:
 * - este arquivo não deve concentrar composição de auth;
 * - sua função é apenas adaptar o mecanismo transacional do Prisma
 *   ao contrato esperado pelos casos de uso do Core;
 * - a composição das dependências de auth deve ocorrer em arquivo próprio
 *   de montagem, como `criarAuthHttpRuntime` ou equivalente.
 *
 * @param prisma Cliente Prisma raiz da aplicação.
 * @returns Implementação de `TransacaoPorta` baseada em `prisma.$transaction`.
 */
export function createTransacaoPorta(prisma: PrismaClient): TransacaoPorta {
  return {
    async executar<T>(fn: () => Promise<T>): Promise<T> {
      return prisma.$transaction(async () => fn());
    },
  };
}
