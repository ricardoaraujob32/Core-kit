// packages/core/src/rbac/repositorioMemoria.ts

import { wrapOk } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";
import type { RbacRepositorio } from "./portasRepositorio";
import type { Papel, Permissao } from "./tipos";

/**
 * Gera a chave composta usada internamente para indexar papéis e permissões
 * por usuário dentro do escopo de um locatário.
 *
 * @param locatarioId Identificador do locatário.
 * @param usuarioId Identificador do usuário.
 * @returns Chave estável no formato `${locatarioId}:${usuarioId}`.
 */
function chave(locatarioId: LocatarioId, usuarioId: UsuarioId) {
  return `${locatarioId}:${usuarioId}`;
}

/**
 * Cria uma implementação em memória da porta `RbacRepositorio`.
 *
 * Esta implementação é voltada a testes unitários do domínio de autorização
 * e mantém coleções separadas de papéis e permissões por usuário/locatário.
 *
 * Recursos auxiliares expostos além da porta:
 * - `seed(...)`: injeta papéis/permissões no estado interno;
 * - `dump()`: devolve o estado atual em formato serializável;
 * - `stats()`: devolve contadores de chamadas para inspeção em testes.
 *
 * @param seed Coleção inicial opcional de atribuições de RBAC.
 * @returns Repositório em memória compatível com a porta de RBAC.
 */
export function criarRbacRepositorioMemoria(
  seed?: Array<{
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
    papeis?: Papel[];
    permissoes?: Permissao[];
  }>,
): RbacRepositorio & {
  /**
   * Injeta papéis e permissões diretamente no estado interno.
   *
   * @param params Atribuição inicial a ser semeada.
   */
  seed(params: {
    locatarioId: LocatarioId;
    usuarioId: UsuarioId;
    papeis?: Papel[];
    permissoes?: Permissao[];
  }): void;

  /**
   * Retorna uma visão serializável do estado atual do repositório.
   *
   * @returns Mapas materializados de papéis e permissões por chave composta.
   */
  dump(): {
    papeis: Record<string, Papel[]>;
    permissoes: Record<string, Permissao[]>;
  };

  /**
   * Retorna estatísticas simples de uso do repositório.
   *
   * Útil para verificar cache, número de consultas e comportamento
   * esperado em testes unitários.
   *
   * @returns Contadores de chamadas por operação.
   */
  stats(): {
    listarPapeisDoUsuario: number;
    listarPermissoesEfetivasDoUsuario: number;
  };
} {
  const papeisPorUsuario = new Map<string, Papel[]>();
  const permissoesPorUsuario = new Map<string, Permissao[]>();

  let countPapeis = 0;
  let countPermissoes = 0;

  const api = {
    seed(params: {
      locatarioId: LocatarioId;
      usuarioId: UsuarioId;
      papeis?: Papel[];
      permissoes?: Permissao[];
    }) {
      const k = chave(params.locatarioId, params.usuarioId);
      papeisPorUsuario.set(k, [...(params.papeis ?? [])]);
      permissoesPorUsuario.set(k, [...(params.permissoes ?? [])]);
    },

    dump() {
      return {
        papeis: Object.fromEntries(papeisPorUsuario.entries()),
        permissoes: Object.fromEntries(permissoesPorUsuario.entries()),
      };
    },

    stats() {
      return {
        listarPapeisDoUsuario: countPapeis,
        listarPermissoesEfetivasDoUsuario: countPermissoes,
      };
    },

    async listarPapeisDoUsuario(params: {
      locatarioId: LocatarioId;
      usuarioId: UsuarioId;
    }) {
      countPapeis += 1;
      return wrapOk([
        ...(papeisPorUsuario.get(chave(params.locatarioId, params.usuarioId)) ??
          []),
      ]);
    },

    async listarPermissoesEfetivasDoUsuario(params: {
      locatarioId: LocatarioId;
      usuarioId: UsuarioId;
    }) {
      countPermissoes += 1;
      return wrapOk([
        ...(permissoesPorUsuario.get(
          chave(params.locatarioId, params.usuarioId),
        ) ?? []),
      ]);
    },
  };

  for (const item of seed ?? []) {
    api.seed(item);
  }

  return api;
}
