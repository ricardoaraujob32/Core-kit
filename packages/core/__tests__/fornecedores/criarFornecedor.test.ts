// packages/core/__tests__/fornecedores/criarFornecedor.test.ts

import { describe, expect, it } from "vitest";
import { createFnCriarFornecedor } from "../../src/fornecedores/usecases/criarFornecedor";
import { criarFornecedoresSimulacroRepositorio } from "./simulacros/fornecedoresSimulacroRepositorio";
import {
  criarIdPortaSequencial,
  DATA_TESTE,
  relogioTeste,
} from "./helpers/fornecedoresUsecaseTestUtils";

describe("#1 - createFnCriarFornecedor", () => {
  it("#1.1 - deve criar fornecedor com dados válidos", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();

    const usecase = createFnCriarFornecedor({
      fornecedoresRepositorio: repo,
      idPorta: criarIdPortaSequencial(["fornecedor-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      nome: "Fornecedor Teste",
      documento: "123456789",
      email: "fornecedor@example.com",
      telefone: "11999999999",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.fornecedorId).toBe("fornecedor-1");

    const salvo = repo.dump()[0];

    expect(salvo?.nome).toBe("Fornecedor Teste");
    expect(salvo?.status).toBe("ATIVO");
    expect(salvo?.criadoEm).toEqual(DATA_TESTE);
    expect(salvo?.atualizadoEm).toEqual(DATA_TESTE);
  });

  it("#1.2 - deve falhar quando locatarioId é inválido", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();

    const usecase = createFnCriarFornecedor({
      fornecedoresRepositorio: repo,
      idPorta: criarIdPortaSequencial(["fornecedor-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: " ",
      nome: "Fornecedor Teste",
    } as never);

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando nome é inválido", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();

    const usecase = createFnCriarFornecedor({
      fornecedoresRepositorio: repo,
      idPorta: criarIdPortaSequencial(["fornecedor-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      nome: " ",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando e-mail opcional é inválido", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();

    const usecase = createFnCriarFornecedor({
      fornecedoresRepositorio: repo,
      idPorta: criarIdPortaSequencial(["fornecedor-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      nome: "Fornecedor Teste",
      email: "email-invalido",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao criar", async () => {
    const repo = criarFornecedoresSimulacroRepositorio();
    repo.simularFalha("criar");

    const usecase = createFnCriarFornecedor({
      fornecedoresRepositorio: repo,
      idPorta: criarIdPortaSequencial(["fornecedor-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      nome: "Fornecedor Teste",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
