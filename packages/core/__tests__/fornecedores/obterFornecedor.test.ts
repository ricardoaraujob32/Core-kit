// packages/core/__tests__/fornecedores/obterFornecedor.test.ts

import { describe, expect, it } from "vitest";
import { createFnObterFornecedor } from "../../src/fornecedores/usecases/obterFornecedor";
import {
  criarFornecedorTeste,
  criarFornecedoresSimulacroRepositorio,
} from "./simulacros/fornecedoresSimulacroRepositorio";

describe("#1 - createFnObterFornecedor", () => {
  it("#1.1 - deve obter fornecedor existente", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnObterFornecedor({ fornecedoresRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.fornecedor.fornecedorId).toBe("fornecedor-1");
  });

  it("#1.2 - deve falhar quando fornecedor não existe", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();
    const usecase = createFnObterFornecedor({ fornecedoresRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-x",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando fornecedor pertence a outro locatário", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-2" }),
    ]);

    const usecase = createFnObterFornecedor({ fornecedoresRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando fornecedor está excluído logicamente", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({
        fornecedorId: "fornecedor-1",
        locatarioId: "loc-1",
        excluidoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnObterFornecedor({ fornecedoresRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao buscar", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();
    repo.simularFalha("buscarPorId");

    const usecase = createFnObterFornecedor({ fornecedoresRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
