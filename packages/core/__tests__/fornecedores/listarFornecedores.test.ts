// packages/core/__tests__/fornecedores/listarFornecedores.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarFornecedores } from "../../src/fornecedores/usecases/listarFornecedores";
import {
  criarFornecedorTeste,
  criarFornecedoresSimulacroRepositorio,
} from "./simulacros/fornecedoresSimulacroRepositorio";

describe("#1 - createFnListarFornecedores", () => {
  it("#1.1 - deve listar apenas fornecedores do locatário", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
      criarFornecedorTeste({ fornecedorId: "fornecedor-2", locatarioId: "loc-1" }),
      criarFornecedorTeste({ fornecedorId: "fornecedor-3", locatarioId: "loc-2" }),
    ]);

    const usecase = createFnListarFornecedores({ fornecedoresRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((item) => item.fornecedorId)).toEqual([
        "fornecedor-1",
        "fornecedor-2",
      ]);
    }
  });

  it("#1.2 - deve respeitar cursor e limite", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
      criarFornecedorTeste({ fornecedorId: "fornecedor-2", locatarioId: "loc-1" }),
      criarFornecedorTeste({ fornecedorId: "fornecedor-3", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnListarFornecedores({ fornecedoresRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      cursor: "fornecedor-1",
      limite: 1,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((item) => item.fornecedorId)).toEqual(["fornecedor-2"]);
    }
  });

  it("#1.3 - deve retornar lista vazia quando não há registros", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();
    const usecase = createFnListarFornecedores({ fornecedoresRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens).toEqual([]);
  });

  it("#1.4 - deve ignorar registros excluídos logicamente", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
      criarFornecedorTeste({
        fornecedorId: "fornecedor-2",
        locatarioId: "loc-1",
        excluidoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnListarFornecedores({ fornecedoresRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((item) => item.fornecedorId)).toEqual(["fornecedor-1"]);
    }
  });

  it("#1.5 - deve propagar falha do repositório ao listar", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();
    repo.simularFalha("listarPorLocatario");

    const usecase = createFnListarFornecedores({ fornecedoresRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
