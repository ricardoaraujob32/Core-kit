// packages/core/__tests__/fornecedores/reativarFornecedor.test.ts

import { describe, expect, it } from "vitest";
import { createFnReativarFornecedor } from "../../src/fornecedores/usecases/reativarFornecedor";
import {
  criarFornecedorTeste,
  criarFornecedoresSimulacroRepositorio,
} from "./simulacros/fornecedoresSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/fornecedoresUsecaseTestUtils";

describe("#1 - createFnReativarFornecedor", () => {
  it("#1.1 - deve reativar fornecedor existente", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({
        fornecedorId: "fornecedor-1",
        locatarioId: "loc-1",
        status: "INATIVO",
      }),
    ]);

    const usecase = createFnReativarFornecedor({
      fornecedorsRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.fornecedor.status).toBe("ATIVO");
      expect(resultado.value.fornecedor.atualizadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve falhar quando fornecedor não existe", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();

    const usecase = createFnReativarFornecedor({
      fornecedorsRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-x",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando fornecedor está excluído logicamente", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({
        fornecedorId: "fornecedor-1",
        locatarioId: "loc-1",
        excluidoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnReativarFornecedor({
      fornecedorsRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      fornecedorId: "fornecedor-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarFornecedoresSimulacroRepositorio([
      criarFornecedorTeste({ fornecedorId: "fornecedor-1", locatarioId: "loc-1" }),
    ]);
    repo.simularFalha("atualizar");

    const usecase = createFnReativarFornecedor({
      fornecedorsRepositorio: repo,
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
