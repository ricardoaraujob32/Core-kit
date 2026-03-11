// import { wrapOk } from "../result";
import { wrapOk } from "../result";
import type { RbacRepositorio } from "./portasRepositorio";
import type { Papel, Permissao } from "./tipos";

function chave(locatarioId: string, usuarioId: string) {
  return `${locatarioId}:${usuarioId}`;
}

export function criarRbacRepositorioMemoria(
  seed?: Array<{
    locatarioId: string;
    usuarioId: string;
    papeis?: Papel[];
    permissoes?: Permissao[];
  }>
): RbacRepositorio & {
  seed(params: {
    locatarioId: string;
    usuarioId: string;
    papeis?: Papel[];
    permissoes?: Permissao[];
  }): void;
  dump(): {
    papeis: Record<string, Papel[]>;
    permissoes: Record<string, Permissao[]>;
  };
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
      locatarioId: string;
      usuarioId: string;
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
      locatarioId: string;
      usuarioId: string;
    }) {
      countPapeis += 1;
      return wrapOk([
        ...(papeisPorUsuario.get(chave(params.locatarioId, params.usuarioId)) ??
          []),
      ]);
    },

    async listarPermissoesEfetivasDoUsuario(params: {
      locatarioId: string;
      usuarioId: string;
    }) {
      countPermissoes += 1;
      return wrapOk([
        ...(permissoesPorUsuario.get(
          chave(params.locatarioId, params.usuarioId)
        ) ?? []),
      ]);
    },
  };

  for (const item of seed ?? []) {
    api.seed(item);
  }

  return api;
}