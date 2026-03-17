import { describe, expect, it } from "vitest";
import { createListarLocatarios } from "../../src/locatarios/usecases/listarLocatarios";
import { criarLocatarioSeed, criarLocatariosRepositorioMemoria } from "../../src/locatarios/repositorioMemoria";

describe("listarLocatarios", () => {
  it("lista locatários ordenados por nome", async () => {
    const repo = criarLocatariosRepositorioMemoria([
      criarLocatarioSeed({ locatarioId: "loc-2", nome: "Beta" }),
      criarLocatarioSeed({ locatarioId: "loc-1", nome: "Alpha" }),
    ]);

    const usecase = createListarLocatarios({ locRepo: repo });

    const resultado = await usecase();

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.itens).toHaveLength(2);
    expect(resultado.value.itens[0]?.nome).toBe("Alpha");
    expect(resultado.value.itens[1]?.nome).toBe("Beta");
  });
});