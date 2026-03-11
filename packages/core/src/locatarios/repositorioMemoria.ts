// import { wrapOk } from "../result";
import { wrapOk } from "../result";
import type { LocatariosRepositorio } from "./portasRepositorio";
import type { Locatario, LocatarioStatus } from "./tipos";

export function criarLocatariosRepositorioMemoria(
  seed?: Locatario[]
): LocatariosRepositorio & {
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

    async criar(params: { nome: string }) {
      const locatarioId = `loc-${byId.size + 1}`;
      const novo: Locatario = {
        locatarioId,
        nome: params.nome,
        status: "ATIVO",
        criadoEm: new Date("2026-01-01T00:00:00.000Z"),
      };

      byId.set(locatarioId, novo);

      return wrapOk({ locatarioId });
    },

    async buscarPorId(params: { locatarioId: string }) {
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

export function criarLocatarioSeed(params: {
  locatarioId: string;
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