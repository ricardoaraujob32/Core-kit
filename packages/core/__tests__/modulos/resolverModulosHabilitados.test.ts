// packages/core/__tests__/modulos/resolverModulosHabilitados.test.ts

import { describe, expect, it } from "vitest";
import { createFnResolverModulosHabilitados } from "../../src/modulos/usecases/resolverModulosHabilitados";
import { createContextoExecucao } from "../../src/kernel";
import { criarModulosSimulacroRepositorio } from "./simulacros/modulosSimulacroRepositorio";

describe("#1 - createFnResolverModulosHabilitados", () => {
  it("#1.1 - deve enriquecer contexto com módulos habilitados", async () => {
    const repo = criarModulosSimulacroRepositorio([
      { codigo: "vendas", origem: "PLANO" },
      { codigo: "estoque", origem: "MANUAL" },
    ]);

    const usecase = createFnResolverModulosHabilitados({
      repositorio: repo.repositorio,
    });

    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    const resultado = await usecase({ ctx });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.ctx.modulosHabilitados).toEqual([
        "VENDAS",
        "ESTOQUE",
      ]);
      expect(resultado.value.modulos.map((m) => m.codigo)).toEqual([
        "VENDAS",
        "ESTOQUE",
      ]);
    }
  });

  it("#1.2 - deve usar cache para mesma referência de contexto", async () => {
    const repo = criarModulosSimulacroRepositorio([
      { codigo: "VENDAS", origem: "PLANO" },
    ]);

    const usecase = createFnResolverModulosHabilitados({
      repositorio: repo.repositorio,
    });

    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    await usecase({ ctx });
    await usecase({ ctx });

    expect(repo.chamadas()).toBe(1);
  });

  it("#1.3 - deve propagar falha do repositório", async () => {
    const repo = criarModulosSimulacroRepositorio();
    repo.simularFalha("listarPorLocatario");

    const usecase = createFnResolverModulosHabilitados({
      repositorio: repo.repositorio,
    });

    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    const resultado = await usecase({ ctx });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
