// apps/api/src/infra/prisma/auth/createAuthPrismaContexto.ts

import type { PrismaClient } from "@prisma/client";
import type { IdPorta, LocatarioId, UsuarioId } from "@core-kit/core";
import { executarComContexto } from "../execucaoComContexto";
import { createLocatariosRepositorioAuth } from "./locatario/locatariosRepositorioAuthPrisma";
import { createUsuariosRepositorioAuth } from "./usuario/usuariosRepositorioAuthPrisma";
import { createTokensAuthPorta } from "./tokens/tokensAuthPortaPrisma";
import { createRbacAuthPorta } from "./rbac/rbacAuthPortaPrisma";

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
 * Conjunto de dependências de auth criadas sobre um `TransactionClient`
 * já contextualizado.
 *
 * Observação:
 * - este helper existe para apoiar a próxima fase da refatoração;
 * - a meta é centralizar o contexto SQL/RLS na composição da auth,
 *   em vez de espalhá-lo por adapters individuais.
 */
export type AuthDepsContextualizadas = {
  /**
   * Repositório de locatários para autenticação.
   */
  locatariosRepositorioAuth: ReturnType<typeof createLocatariosRepositorioAuth>;

  /**
   * Repositório de usuários para autenticação.
   */
  usuariosRepositorioAuth: ReturnType<typeof createUsuariosRepositorioAuth>;

  /**
   * Porta de tokens de autenticação.
   */
  tokensAuthPorta: ReturnType<typeof createTokensAuthPorta>;

  /**
   * Porta de RBAC da autenticação.
   */
  rbacAuthPorta: ReturnType<typeof createRbacAuthPorta>;
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
 * - este helper ainda não governa todo o fluxo principal da auth;
 * - ele existe para servir de base à Fase 2 do plano de refatoração.
 *
 * @typeParam T Tipo de retorno da operação executada.
 * @param prisma Cliente Prisma raiz.
 * @param contexto Dados contextuais propagados ao banco.
 * @param idPorta Porta de geração de IDs usada pelos adapters necessários.
 * @param fn Função que receberá as dependências de auth montadas sobre o `tx`.
 * @returns Resultado da operação executada dentro da transação contextualizada.
 */
export async function executarAuthComContexto<T>(prisma: PrismaClient, contexto: AuthContextoBanco, idPorta: IdPorta,
  fn: (deps: AuthDepsContextualizadas) => Promise<T>): Promise<T> {
  return executarComContexto(
    prisma,
    {
      usuarioId: contexto.usuarioId,
      locatarioId: contexto.locatarioId,
      isPlataforma: contexto.isPlataforma ?? false,
    },
    async (tx) => {
      return fn({
        locatariosRepositorioAuth: createLocatariosRepositorioAuth(tx),
        usuariosRepositorioAuth: createUsuariosRepositorioAuth(tx),
        tokensAuthPorta: createTokensAuthPorta(tx, idPorta),
        rbacAuthPorta: createRbacAuthPorta(tx),
      });
    },
  );
}