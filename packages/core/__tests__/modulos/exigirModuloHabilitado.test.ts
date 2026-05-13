// packages/core/__tests__/modulos/exigirModuloHabilitado.test.ts

import { describe, expect, it } from "vitest";
import { createFnExigirModuloHabilitado } from "../../src/modulos/usecases/exigirModuloHabilitado";
import { criarModulosSimulacroRepositorio } from "./simulacros/modulosSimulacroRepositorio";

describe("#1 - createFnExigirModuloHabilitado", () => {
  it("#1.1 - deve retornar Ok quando módulo está habilitado", async () => {
    const repo = criarModulosSimulacroRepositorio([
      { codigo: "VENDAS", origem: "PLANO" },
    ]);

    const usecase = createFnExigirModuloHabilitado({
      repositorio: repo.repositorio,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      codigo: "VENDAS",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.habilitado).toBe(true);
  });

  it("#1.2 - deve falhar quando módulo não está habilitado", async () => {
    const repo = criarModulosSimulacroRepositorio();

    const usecase = createFnExigirModuloHabilitado({
      repositorio: repo.repositorio,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      codigo: "VENDAS",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("MODULO_NAO_HABILITADO");
  });
});
