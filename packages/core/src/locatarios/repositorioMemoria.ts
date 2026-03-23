// packages/core/src/locatarios/repositorioMemoria.ts

import { wrapOk } from "../kernel";
import type { LocatariosRepositorio } from "./portasRepositorio";
import type { Locatario, LocatarioId, LocatarioStatus } from "./tipos";

/**
 * Cria uma implementação em memória da porta `LocatariosRepositorio`.
 *
 * Esta implementação existe para testes unitários e cenários de desenvolvimento
 * controlado. Ela mantém os locatários em um `Map` interno, sem dependência de
 * banco de dados, ORM ou infraestrutura externa.
 *
 * Recursos auxiliares expostos além da porta:
 * - `seed(...)`: injeta locatários diretamente no estado interno;
 * - `dump()`: devolve uma cópia defensiva do estado persistido.
 *
 * @param seed Coleção inicial opcional de locatários para pré-carregar o repositório.
 * @returns Repositório em memória compatível com a porta de locatários.
 */
export function criarLocatariosRepositorioMemoria(seed?: Locatario[]): LocatariosRepositorio & {
  /**
   * Injeta um locatário diretamente no estado interno do repositório.
   *
   * Útil para preparar cenários de teste sem passar pelos casos de uso.
   *
   * @param locatario Entidade de locatário a ser semeada.
   */
  seed(locatario: Locatario): void;

  /**
   * Retorna uma cópia defensiva do estado atual do repositório.
   *
   * @returns Coleção de locatários atualmente armazenados em memória.
   */
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
 * Cria uma entidade `Locatario` pronta para uso em testes.
 *
 * Este helper atua como factory de seed, reduzindo repetição em cenários
 * unitários e padronizando valores default para campos opcionais.
 *
 * Defaults atuais:
 * - `status`: `"ATIVO"`
 * - `criadoEm`: `2026-01-01T00:00:00.000Z`
 *
 * @param params Dados base do locatário de teste.
 * @returns Entidade `Locatario` materializada.
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
