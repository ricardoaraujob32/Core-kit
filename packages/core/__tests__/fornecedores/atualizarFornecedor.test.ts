// packages/core/__tests__/fornecedores/atualizarFornecedor.test.ts

import { describe, expect, it } from "vitest";
import { createFnAtualizarFornecedor } from "../../src/fornecedores/usecases/atualizarFornecedor";
import {
  criarFornecedorTeste,
  criarFornecedoresSimulacroRepositorio,
} from "./simulacros/fornecedoresSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/fornecedoresUsecaseTestUtils";

describe("#1 - createFnAtualizarFornecedor", () => {
  it("#1.1 - deve atualizar dados cadastrais do fornecedor", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnAtualizarFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
      nome: "Fornecedor Atualizado",
      documento: "987654321",
      email: "novo@example.com",
      telefone: "11888888888",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.fornecedor.nome).toBe("Fornecedor Atualizado");
      expect(resultado.value.fornecedor.email).toBe("novo@example.com");
      expect(resultado.value.fornecedor.atualizadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve preservar campos não informados", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({
        fornecedorId: "fornecedor-1",
        locatarioId: "loc-1",
        nome: "Fornecedor Original",
        email: "original@example.com",
      }),
    ]);

    const usecase = createFnAtualizarFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
      nome: "Fornecedor Atualizado",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.fornecedor.nome).toBe("Fornecedor Atualizado");
      expect(resultado.value.fornecedor.email).toBe("original@example.com");
    }
  });

  it("#1.3 - deve falhar quando fornecedor não existe", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();

    const usecase = createFnAtualizarFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-x",
      nome: "Fornecedor Atualizado",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando nome informado é inválido", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnAtualizarFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
      nome: " ",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
    ]);
    repo.simularFalha("atualizar");

    const usecase = createFnAtualizarFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
      nome: "Fornecedor Atualizado",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
