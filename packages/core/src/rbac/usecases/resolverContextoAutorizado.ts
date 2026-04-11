// packages/core/src/auth/usecases/resolverContextoAutorizado.ts

import { createContextoExecucao, wrapOk } from "../../kernel";
import { RbacAuthPorta } from "../../auth/portasServico";
import { ResolverContextoAutorizadoInput, ResolverContextoAutorizadoOutput, ResolverContextoAutorizadoResult } from "../tipos";

/**
 * Cria o caso de uso responsável por resolver o contexto autorizado
 * a partir de uma sessão já validada.
 *
 * Este caso de uso:
 * - constrói um contexto mínimo contendo `locatarioId` e `usuarioId`;
 * - delega ao serviço de RBAC a resolução de papéis e permissões;
 * - devolve apenas o contexto enriquecido.
 *
 * Dependências:
 * - `rbacPorta`: serviço de resolução de permissões do usuário.
 *
 * @param deps Dependências externas necessárias para a execução.
 * @returns Função `resolverContextoAutorizado` pronta para receber a entrada do caso de uso.
 */
export function createFnResolverContextoAutorizado(deps: {rbacPorta: RbacAuthPorta}) {
   /**
   * Executa o caso de uso de resolução do contexto autorizado.
   *
   * Fluxo:
   * 1. materializa um contexto base com `locatarioId` e `usuarioId`;
   * 2. chama `resolverPermissoes` na porta de RBAC;
   * 3. devolve o contexto final enriquecido.
   *
   * @param input Sessão já validada e pronta para enriquecimento de autorização.
   * @returns `Ok(ctx)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function resolverContextoAutorizado(input: ResolverContextoAutorizadoInput): ResolverContextoAutorizadoResult {
    const ctx = createContextoExecucao({
      locatarioId: input.sessao.locatarioId,
      usuarioId: input.sessao.usuarioId,
    });

    const ctxRes = await deps.rbacPorta.resolverPermissoes(ctx);
    if (!ctxRes.ok) return ctxRes;

    return wrapOk<ResolverContextoAutorizadoOutput>({
      ctx: ctxRes.value,
    });
  };
}
