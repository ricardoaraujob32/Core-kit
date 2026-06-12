// packages/core/__tests__/locatarios/listarLocatarios.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarLocatarios } from "../../src/locatarios/usecases/listarLocatarios";
import { criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";

describe("#1 - createFnListarLocatarios", () => {
  it("#1.1 - deve listar locatários ordenados por nome", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-2", nome: "Beta", slug: "beta" }),
      criarLocatarioTeste({ locatarioId: "loc-1", nome: "Alpha", slug: "alpha" }),
    ]);

    const usecase = createFnListarLocatarios({ locatariosRepositorio: repo });

    const resultado = await usecase({} as never);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((item) => item.nome)).toEqual(["Alpha", "Beta"]);
    }
  });

  it("#1.2 - deve retornar lista vazia quando não há locatários", async () => {
    const repo = criarLocatariosSimulacroRepositorio();
    const usecase = createFnListarLocatarios({ locatariosRepositorio: repo });

    const resultado = await usecase({} as never);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens).toEqual([]);
  });

  it("#1.3 - deve propagar falha do repositório", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    repo.simularFalha("listar");

    const usecase = createFnListarLocatarios({ locatariosRepositorio: repo });

    const resultado = await usecase({} as never);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de listar locatários", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", nome: "Beta" }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake();

    const usecase = createFnListarLocatarios({
      locatariosRepositorio: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({} as never);

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "LOCATARIO_LISTAR",
    });
  });

  it("#2.2 - deve retornar erro quando política negar listagem", async () => {
    const repo = criarLocatariosSimulacroRepositorio();
    const politica = criarPoliticaSegurancaLocatariosFake({ autorizado: false });

    const usecase = createFnListarLocatarios({
      locatariosRepositorio: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({} as never);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
      expect(resultado.error.detalhes?.operacao).toBe("LOCATARIO_LISTAR");
    }
  });
});