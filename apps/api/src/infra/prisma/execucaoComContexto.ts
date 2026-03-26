// apps/api/src/infra/prisma/execucaoComContexto.ts

import { LocatarioId, UsuarioId } from "@core-kit/core";
import type { PrismaClient } from "@prisma/client";

/**
 * Contexto lógico propagado para o banco durante uma transação.
 *
 * Este contexto permite alinhar o estado da aplicação com mecanismos
 * contextuais do banco, como:
 * - RLS
 * - funções dependentes do usuário corrente
 * - distinção entre escopo de plataforma e escopo de locatário
 */
export interface ContextoBanco {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId | null;
  isPlataforma: boolean;
}

/**
 * Executa uma função dentro de uma transação Prisma após registrar
 * o contexto lógico no banco via `app_definir_contexto(...)`.
 *
 * Fluxo:
 * 1. abre transação;
 * 2. chama a função SQL que grava o contexto da sessão/transação;
 * 3. executa a operação de negócio no `tx`.
 *
 * @param prisma Cliente Prisma raiz.
 * @param contexto Dados contextuais a serem propagados ao banco.
 * @param fn Função que receberá o cliente transacional.
 * @returns Resultado da função executada dentro da transação contextualizada.
 */
export async function executarComContexto<T>(prisma: PrismaClient, contexto: ContextoBanco, fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
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
