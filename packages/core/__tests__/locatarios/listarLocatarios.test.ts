import { describe, it, expect } from "vitest";
import { criarListarLocatarios } from "../../src/locatarios/usecases/listarLocatarios";
import {
  criarLocatarioSeed,
  criarLocatariosRepositorioMemoria,
} from "../../src/locatarios/repositorioMemoria";

describe("locatarios - listarLocatarios", () => {
  it("lista locatários ordenados por nome", async () => {
    const repo = criarLocatariosRepositorioMemoria([
      criarLocatarioSeed({
        locatarioId: "loc-2",
        nome: "Zeta Loja",
      }),
      criarLocatarioSeed({
        locatarioId: "loc-1",
        nome: "Alfa Loja",
      }),
    ]);

    const listarLocatarios = criarListarLocatarios({
      locRepo: repo,
    });

    const r = await listarLocatarios();

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.itens).toHaveLength(2);
      expect(r.value.itens[0].nome).toBe("Alfa Loja");
      expect(r.value.itens[1].nome).toBe("Zeta Loja");
    }
  });

  it("propaga erro do repositório", async () => {
    const listarLocatarios = criarListarLocatarios({
      locRepo: {
        async criar() {
          throw new Error("não usado");
        },
        async buscarPorId() {
          throw new Error("não usado");
        },
        async listar() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao listar",
            },
          };
        },
      },
    });

    const r = await listarLocatarios();

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });
});