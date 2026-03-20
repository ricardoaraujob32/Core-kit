// packages/core/src/locatarios/repositorioMemoria.ts

import { wrapOk } from "../kernel";
import type { LocatariosRepositorio } from "./portasRepositorio";
import type { Locatario, LocatarioId, LocatarioStatus } from "./tipos";

/**
 * 
 * @param seed 
 * @returns 
 */
export function criarLocatariosRepositorioMemoria(seed?: Locatario[]): LocatariosRepositorio & {
  seed(locatario: Locatario): void;
  dump(): Locatario[];
} {
  const byId = new Map<string, Locatario>();

  const api = {
    seed(locatario: Locatario) {
      byId.set(locatario.locatarioId, { ...locatario });
    },

    dump() {
      return [...byId.values()].map((item) => ({ ...item }));
    },

    async criar(params: {
      locatarioId: LocatarioId;
      nome: string;
      status: "ATIVO";
      criadoEm: Date;
    }) {
      const novo: Locatario = {
        locatarioId: params.locatarioId,
        nome: params.nome,
        status: params.status,
        criadoEm: params.criadoEm,
      };

      byId.set(params.locatarioId, novo);

      return wrapOk({ locatarioId: params.locatarioId });
    },

    async buscarPorId(params: { locatarioId: LocatarioId }) {
      const found = byId.get(params.locatarioId) ?? null;
      return wrapOk(found ? { ...found } : null);
    },

    async listar() {
      const itens = [...byId.values()]
        .map((item) => ({ ...item }))
        .sort((a, b) => a.nome.localeCompare(b.nome));

      return wrapOk(itens);
    },
  };

  for (const item of seed ?? []) {
    api.seed(item);
  }

  return api;
}

/**
 * 
 * @param params 
 * @returns 
 */
export function criarLocatarioSeed(params: {
  locatarioId: LocatarioId;
  nome: string;
  status?: LocatarioStatus;
  criadoEm?: Date;
}): Locatario {
  return {
    locatarioId: params.locatarioId,
    nome: params.nome,
    status: params.status ?? "ATIVO",
    criadoEm: params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z"),
  };
}