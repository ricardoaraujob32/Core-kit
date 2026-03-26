// apps/api/src/infra/auth/compartilhado/errosInfraAuth.ts

import { createErroApp } from "@core-kit/core";

/**
 * Helper local para padronizar erros de infraestrutura da área de autenticação.
 *
 * Responsabilidade:
 * - encapsular falhas técnicas locais de adapters de auth em `ErroApp`.
 *
 * Observação:
 * - quando o erro vier diretamente do Prisma e precisar de mapeamento mais rico
 *   (`CONFLITO`, `NAO_ENCONTRADO`), considere delegar para o mapper transversal
 *   de `infra/prisma/erros.ts`.
 *
 * @param mensagem Mensagem final do erro.
 * @param causa Erro técnico original.
 * @param detalhes Metadados adicionais relevantes para diagnóstico.
 * @returns `Err(ErroApp)` no formato esperado pelo Core.
 */
export function erroInfraAuth(mensagem: string, causa: unknown, detalhes?: Record<string, unknown>) {
  return createErroApp({ codigo: "ERRO_INTERNO", mensagem, detalhes, causa });
}
