// apps/api/src/infra/prisma/auth/createAuthPrismaContexto.ts

import type { PrismaClient } from "@prisma/client";
import type { IdPorta, LocatarioId, UsuarioId } from "@core-kit/core";
import { executarComContexto } from "../execucaoComContexto";
import { AuthPrismaAdapters, createAuthPrismaAdapters } from "./authPrismaAdapters";

/**
 * Contexto lógico mínimo necessário para abrir uma execução de auth
 * contextualizada no banco.
 */
export type AuthContextoBanco = {
  /**
   * Usuário cuja identidade será propagada para a transação.
   */
  usuarioId: UsuarioId;

  /**
   * Locatário associado ao contexto atual.
   */
  locatarioId: LocatarioId;

  /**
   * Indica se o contexto deve ser tratado como escopo de plataforma.
   */
  isPlataforma?: boolean;
};

/**
 * Executa uma operação de autenticação dentro de uma transação Prisma
 * com contexto SQL previamente propagado ao banco.
 *
 * Fluxo:
 * 1. abre transação contextualizada;
 * 2. cria adapters de auth sobre o `tx`;
 * 3. executa a função chamadora com essas dependências.
 *
 * Observação:
 * - * - este helper é o ponto oficial de abertura de contexto SQL/RLS para auth;
 * - ele existe para servir de base à Fase 2 do plano de refatoração.
 *
 * @typeParam T Tipo de retorno da operação executada.
 * @param prisma Cliente Prisma raiz.
 * @param contexto Dados contextuais propagados ao banco.
 * @param idPorta Porta de geração de IDs usada pelos adapters necessários.
 * @param fn Função que receberá as dependências de auth montadas sobre o `tx`.
 * @returns Resultado da operação executada dentro da transação contextualizada.
 */
export async function executarAuthComContexto<T>(
  prisma: PrismaClient,
  contexto: AuthContextoBanco,
  idPorta: IdPorta,
  fn: (adapters: AuthPrismaAdapters) => Promise<T>,
): Promise<T> {
  return executarComContexto(
    prisma,
    {
      usuarioId: contexto.usuarioId,
      locatarioId: contexto.locatarioId,
      isPlataforma: contexto.isPlataforma ?? false,
    },
    async (tx) => {
      const adapters = createAuthPrismaAdapters(tx, { idPorta });
      return fn(adapters);
    },
  );
}
