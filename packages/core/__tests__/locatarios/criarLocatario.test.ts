// packages/core/__tests__/locatarios/criarLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnCriarLocatario } from "../../src/locatarios/usecases/criarLocatario";
import { criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { criarIdPortaSequencial, criarInputCriarLocatario, relogioTeste } from "./helpers/locatariosUsecaseTestUtils";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";

describe("#1 - createFnCriarLocatario", () => {
  it("#1.1 - deve criar locatário com dados válidos e configuração inicial ativa", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnCriarLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["loc-1", "cfg-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarLocatario());

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.locatarioId).toBe("loc-1");

    const salvo = await repo.buscarPorId({ locatarioId: "loc-1" });

    expect(salvo.ok).toBe(true);
    if (salvo.ok && salvo.value) {
      expect(salvo.value.slug).toBe("empresa-teste");
      expect(salvo.value.email).toBe("contato@empresa-teste.com");
      expect(salvo.value.status).toBe("ATIVO");
      expect(salvo.value.configuracoes[0]?.configuracaoId).toBe("cfg-1");
      expect(salvo.value.configuracoes[0]?.ativa).toBe(true);
    }
  });

  it("#1.2 - deve falhar quando nome é inválido", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnCriarLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["loc-1", "cfg-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarLocatario({ nome: " " }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_INVALIDO");
  });

  it("#1.3 - deve falhar quando slug já existe", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({
        locatarioId: "loc-existente",
        slug: "empresa-teste",
        email: "outro@email.com",
      }),
    ]);

    const usecase = createFnCriarLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["loc-1", "cfg-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarLocatario());

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando e-mail já existe", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({
        locatarioId: "loc-existente",
        slug: "outro-slug",
        email: "contato@empresa-teste.com",
      }),
    ]);

    const usecase = createFnCriarLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["loc-1", "cfg-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarLocatario());

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao consultar slug", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    repo.simularFalha("buscarPorSlug");

    const usecase = createFnCriarLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["loc-1", "cfg-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase(criarInputCriarLocatario());

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

const inputCriarLocatarioValido = {
  nome: "Locatário Teste",
  slug: "locatario-teste",
  documento: null,
  email: "teste@example.com",
  fusoHorario: "America/Sao_Paulo",
  configuracaoInicial: {
    modoTema: "SISTEMA",
    identidadeVisual: "locatario-teste",
    corPrimaria: null,
    corSecundaria: null,
    corTerciaria: null,
    urlLogo: null,
    ativa: true,
  },
} as const;

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de criar locatário", async () => {
    const repo = criarLocatariosSimulacroRepositorio();
    const politica = criarPoliticaSegurancaLocatariosFake();

    const usecase = createFnCriarLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["loc-1", "cfg-1"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase(inputCriarLocatarioValido);

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "LOCATARIO_CRIAR",
    });
  });

  it("#2.2 - deve retornar erro quando política negar criação", async () => {
    const repo = criarLocatariosSimulacroRepositorio();
    const politica = criarPoliticaSegurancaLocatariosFake({ autorizado: false });

    const usecase = createFnCriarLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["loc-1", "cfg-1"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase(inputCriarLocatarioValido);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
      expect(resultado.error.detalhes?.operacao).toBe("LOCATARIO_CRIAR");
    }
  });
});