// packages/core/__tests__/fornecedores/excluirFornecedor.test.ts

import { describe, expect, it } from "vitest";
import { createFnExcluirFornecedor } from "../../src/fornecedores/usecases/excluirFornecedor";
import {
  criarFornecedorTeste,
  criarFornecedoresSimulacroRepositorio,
} from "./simulacros/fornecedoresSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/fornecedoresUsecaseTestUtils";

describe("#1 - createFnExcluirFornecedor", () => {
  it("#1.1 - deve excluir logicamente fornecedor existente", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnExcluirFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
      excluidoPor: "usr-1",
      excluidoMotivo: " solicitação do usuário ",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.fornecedor.excluidoEm).toEqual(DATA_TESTE);
      expect(resultado.value.fornecedor.excluidoPor).toBe("usr-1");
      expect(resultado.value.fornecedor.excluidoMotivo).toBe("solicitação do usuário");
      expect(resultado.value.fornecedor.atualizadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve normalizar motivo vazio para null", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnExcluirFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
      excluidoMotivo: " ",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.fornecedor.excluidoMotivo).toBeNull();
  });

  it("#1.3 - deve falhar quando fornecedor não existe", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();

    const usecase = createFnExcluirFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-x",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando fornecedor já está excluído", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({
        fornecedorId: "fornecedor-1",
        locatarioId: "loc-1",
        excluidoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnExcluirFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
    ]);
    repo.simularFalha("atualizar");

    const usecase = createFnExcluirFornecedor({
      fornecedoresRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
