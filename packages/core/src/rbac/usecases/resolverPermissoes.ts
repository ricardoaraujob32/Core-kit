// packages/core/src/rbac/usecases/resolverPermissoes.ts

import { comPapeis, comPermissoes, exigirUsuario, wrapOk } from "../../kernel";
import type { Papel, Permissao, ResolverPermissoesInput, ResolverPermissoesOutput, ResultadoResolverPermissoes } from "../tipos";
import type { RbacRepositorio } from "../portasRepositorio";

/**
 * Entrada de cache em memória associada a um contexto de execução.
 *
 * Cada entrada guarda os papéis e permissões já resolvidos para um dado
 * objeto de contexto, evitando consultas repetidas ao repositório de RBAC
 * enquanto a mesma referência de contexto estiver em uso.
 */
type CacheEntry = {
  /** Permissões efetivas resolvidas para o contexto. */
  permissoes: Permissao[];
  /** Papéis resolvidos para o contexto. */
  papeis: Papel[];
};

/**
 * Cria a função de caso de uso responsável por resolver papéis e permissões
 * de um usuário autenticado.
 *
 * Este caso de uso:
 * - exige que exista usuário autenticado no contexto;
 * - consulta o repositório de RBAC para obter permissões efetivas e papéis;
 * - armazena o resultado em cache por referência do contexto;
 * - enriquece o `ContextoExecucao` com `comPermissoes(...)` e `comPapeis(...)`;
 * - devolve o contexto final junto com as coleções resolvidas.
 *
 * O cache é mantido em um `WeakMap<object, CacheEntry>`, o que significa:
 * - a chave é a própria referência do contexto recebido;
 * - o cache não impede coleta de lixo do contexto;
 * - chamadas repetidas com o mesmo objeto de contexto evitam nova consulta ao repositório.
 *
 * Dependências:
 * - `rbacRepo`: fonte de verdade para papéis e permissões efetivas do usuário.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `resolverPermissoes` pronta para receber a entrada do caso de uso.
 */
export function createFnResolverPermissoes(deps: { rbacRepo: RbacRepositorio }) {
  const cache = new WeakMap<object, CacheEntry>();

  /**
   * Executa o caso de uso de resolução de permissões.
   *
   * Fluxo:
   * 1. exige usuário autenticado no contexto;
   * 2. verifica se já existe resolução em cache para a referência do contexto;
   * 3. se houver cache, reconstrói o contexto enriquecido a partir da entrada armazenada;
   * 4. se não houver cache, consulta permissões efetivas e papéis no repositório;
   * 5. salva o resultado em cache;
   * 6. devolve o contexto enriquecido e as coleções resolvidas.
   *
   * @param input Contexto base usado para resolver autorização.
   * @returns `Ok({ ctx, permissoes, papeis })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function resolverPermissoes(input: ResolverPermissoesInput): ResultadoResolverPermissoes {
    const ctxAutenticado = exigirUsuario(input.ctx);
    if (!ctxAutenticado.ok) return ctxAutenticado;

    const cacheHit = cache.get(input.ctx as object);
    if (cacheHit) {
      const ctxComPermissoes = comPermissoes(input.ctx, cacheHit.permissoes);
      const ctxFinal = comPapeis(ctxComPermissoes, cacheHit.papeis);

      return wrapOk({ctx: ctxFinal});
    }

    const { locatarioId, usuarioId } = ctxAutenticado.value;

    const permissoesRes =
      await deps.rbacRepo.listarPermissoesEfetivasDoUsuario({
        locatarioId,
        usuarioId,
      });
    if (!permissoesRes.ok) return permissoesRes;

    const papeisRes = await deps.rbacRepo.listarPapeisDoUsuario({
      locatarioId,
      usuarioId,
    });
    if (!papeisRes.ok) return papeisRes;

    const permissoes = [...permissoesRes.value];
    const papeis = [...papeisRes.value];

    cache.set(input.ctx as object, { permissoes, papeis });

    const ctxComPermissoes = comPermissoes(input.ctx, permissoes);
    const ctxFinal = comPapeis(ctxComPermissoes, papeis);

    return wrapOk({ctx: ctxFinal});
  };
}
