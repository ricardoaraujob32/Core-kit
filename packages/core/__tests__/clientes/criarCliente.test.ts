// packages/core/__tests__/clientes/criarCliente.test.ts

import { describe, expect, it } from "vitest";
import { createFnCriarCliente } from "../../src/clientes/usecases/criarCliente";
import { criarClientesSimulacroRepositorio } from "./simulacros/clientesSimulacroRepositorio";
import {
  criarIdPortaSequencial,
  DATA_TESTE,
  relogioTeste,
} from "./helpers/clientesUsecaseTestUtils";

describe("#1 - createFnCriarCliente", () => {
  it("#1.1 - deve criar cliente com dados válidos", async () => {
    const repo = criarClientesSimulacroRepositorio();

    const usecase = createFnCriarCliente({
      clientesRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cliente-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      nome: "Cliente Teste",
      documento: "123456789",
      email: "cliente@example.com",
      telefone: "11999999999",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.clienteId).toBe("cliente-1");

    const salvo = repo.dump()[0];

    expect(salvo?.nome).toBe("Cliente Teste");
    expect(salvo?.status).toBe("ATIVO");
    expect(salvo?.criadoEm).toEqual(DATA_TESTE);
    expect(salvo?.atualizadoEm).toEqual(DATA_TESTE);
  });

  it("#1.2 - deve falhar quando locatarioId é inválido", async () => {
    const repo = criarClientesSimulacroRepositorio();

    const usecase = createFnCriarCliente({
      clientesRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cliente-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: " ",
      nome: "Cliente Teste",
    } as never);

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando nome é inválido", async () => {
    const repo = criarClientesSimulacroRepositorio();

    const usecase = createFnCriarCliente({
      clientesRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cliente-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      nome: " ",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando e-mail opcional é inválido", async () => {
    const repo = criarClientesSimulacroRepositorio();

    const usecase = createFnCriarCliente({
      clientesRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cliente-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      nome: "Cliente Teste",
      email: "email-invalido",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao criar", async () => {
    const repo = criarClientesSimulacroRepositorio();
    repo.simularFalha("criar");

    const usecase = createFnCriarCliente({
      clientesRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cliente-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      nome: "Cliente Teste",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
