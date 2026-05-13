// packages/core/__tests__/modulos/listarModulosHabilitados.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarModulosHabilitados } from "../../src/modulos/usecases/listarModulosHabilitados";
import { criarModulosSimulacroRepositorio } from "./simulacros/modulosSimulacroRepositorio";

describe("#1 - createFnListarModulosHabilitados", () => {
  it("#1.1 - deve listar módulos habilitados normalizados", async () => {
    const repo = criarModulosSimulacroRepositorio([
      { codigo: "vendas", origem: "PLANO" },
      { codigo: "estoque", origem: "MANUAL" },
    ]);

    const usecase = createFnListarModulosHabilitados({
      repositorio: repo.repositorio,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.locatarioId).toBe("loc-1");
      expect(resultado.value.modulos.map((m) => m.codigo)).toEqual([
        "VENDAS",
        "ESTOQUE",
      ]);
    }
  });

  it("#1.2 - deve retornar lista vazia", async () => {
    const repo = criarModulosSimulacroRepositorio();

    const usecase = createFnListarModulosHabilitados({
      repositorio: repo.repositorio,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.modulos).toEqual([]);
  });

  it("#1.3 - deve propagar falha do repositório", async () => {
    const repo = criarModulosSimulacroRepositorio();
    repo.simularFalha("listarPorLocatario");

    const usecase = createFnListarModulosHabilitados({
      repositorio: repo.repositorio,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
