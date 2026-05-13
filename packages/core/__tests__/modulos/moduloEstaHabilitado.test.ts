// packages/core/__tests__/modulos/moduloEstaHabilitado.test.ts

import { describe, expect, it } from "vitest";
import { createFnModuloEstaHabilitado } from "../../src/modulos/usecases/moduloEstaHabilitado";
import { criarModulosSimulacroRepositorio } from "./simulacros/modulosSimulacroRepositorio";

describe("#1 - createFnModuloEstaHabilitado", () => {
  it("#1.1 - deve retornar habilitado quando módulo existe", async () => {
    const repo = criarModulosSimulacroRepositorio([
      { codigo: "vendas", origem: "PLANO" },
    ]);

    const usecase = createFnModuloEstaHabilitado({
      repositorio: repo.repositorio,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      codigo: "VENDAS",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.habilitado).toBe(true);
      expect(resultado.value.codigo).toBe("VENDAS");
      expect(resultado.value.origem).toBe("PLANO");
    }
  });

  it("#1.2 - deve retornar falso quando módulo não existe", async () => {
    const repo = criarModulosSimulacroRepositorio([
      { codigo: "ESTOQUE", origem: "MANUAL" },
    ]);

    const usecase = createFnModuloEstaHabilitado({
      repositorio: repo.repositorio,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      codigo: "VENDAS",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.habilitado).toBe(false);
  });

  it("#1.3 - deve falhar com código inválido", async () => {
    const repo = criarModulosSimulacroRepositorio();

    const usecase = createFnModuloEstaHabilitado({
      repositorio: repo.repositorio,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      codigo: "",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("MODULOS_CODIGO_INVALIDO");
  });
});
