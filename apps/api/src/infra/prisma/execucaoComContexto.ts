// apps/api/src/infra/prisma/execucaoComContexto.ts

import { LocatarioId, UsuarioId } from "@core-kit/core";
import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * Contexto lógico propagado para o banco durante uma transação.
 *
 * Este contexto permite alinhar o estado da aplicação com mecanismos
 * contextuais do banco, como:
 * - RLS;
 * - funções dependentes do usuário corrente;
 * - distinção entre escopo de plataforma e escopo de locatário.
 */
export interface ContextoBanco {
  /**
   * Usuário cuja identidade será propagada ao banco.
   */
  usuarioId: UsuarioId;

  /**
   * Locatário alvo da operação.
   *
   * Pode ser `null` em cenários de plataforma.
   */
  locatarioId: LocatarioId | null;

  /**
   * Indica se a operação deve rodar em escopo de plataforma.
   */
  isPlataforma: boolean;
}

/**
 * Executa uma função dentro de uma transação Prisma após registrar
 * o contexto lógico da execução no banco.
 *
 * Fluxo:
 * 1. abre transação;
 * 2. chama `core.app_definir_contexto(...)`;
 * 3. executa a função de negócio sobre o `tx`.
 *
 * Observação:
 * - o uso explícito de `core.` evita dependência de `search_path`;
 * - isso foi importante para estabilizar o E2E do login.
 *
 * @typeParam T Tipo de retorno da função executada.
 * @param prisma Cliente Prisma raiz.
 * @param contexto Dados contextuais a serem propagados ao banco.
 * @param fn Função que receberá o cliente transacional.
 * @returns Resultado da função executada dentro da transação contextualizada.
 */
export async function executarComContexto<T>(prisma: PrismaClient, contexto: ContextoBanco, 
  fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SELECT core.app_definir_contexto($1::uuid, $2::uuid, $3::boolean)`,
      contexto.usuarioId,
      contexto.locatarioId,
      contexto.isPlataforma,
    );

    return fn(tx);
  });
}
