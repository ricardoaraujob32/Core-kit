// packages/core/__tests__/locatarios/criarConfiguracaoLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnCriarConfiguracaoLocatario } from "../../src/locatarios/usecases/criarConfiguracaoLocatario";
import { criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { criarIdPortaSequencial, relogioTeste } from "./helpers/locatariosUsecaseTestUtils";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";

describe("#1 - createFnCriarConfiguracaoLocatario", () => {
  it("#1.1 - deve criar nova configuração inativa", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1" }),
    ]);

    const usecase = createFnCriarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cfg-2"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      modoTema: "CLARO",
      identidadeVisual: "Nova Identidade",
      corPrimaria: "#111111",
      corSecundaria: "#222222",
      corTerciaria: "#333333",
      urlLogo: null,
      ativa: false,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.configuracaoId).toBe("cfg-2");
  });

  it("#1.2 - deve falhar quando locatário não existe", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnCriarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cfg-2"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-x",
      modoTema: "CLARO",
      identidadeVisual: "Nova Identidade",
      corPrimaria: "#111111",
      corSecundaria: "#222222",
      corTerciaria: "#333333",
      urlLogo: null,
      ativa: false,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando modo de tema é inválido", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnCriarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cfg-2"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      modoTema: "INVALIDO" as never,
      identidadeVisual: "Nova Identidade",
      corPrimaria: "#111111",
      corSecundaria: "#222222",
      corTerciaria: "#333333",
      urlLogo: null,
      ativa: false,
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao criar configuração", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1" }),
    ]);

    repo.simularFalha("criarConfiguracao");

    const usecase = createFnCriarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cfg-2"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      modoTema: "CLARO",
      identidadeVisual: "Nova Identidade",
      corPrimaria: "#111111",
      corSecundaria: "#222222",
      corTerciaria: "#333333",
      urlLogo: null,
      ativa: false,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de criar configuração", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake();

    const usecase = createFnCriarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cfg-1"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      modoTema: "SISTEMA",
      identidadeVisual: "nova-identidade",
      corPrimaria: null,
      corSecundaria: null,
      corTerciaria: null,
      urlLogo: null,
      ativa: false,
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "LOCATARIO_CONFIGURACAO_CRIAR",
      locatarioId: "loc-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar criação de configuração", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake({ autorizado: false });

    const usecase = createFnCriarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cfg-1"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      modoTema: "SISTEMA",
      identidadeVisual: "nova-identidade",
      corPrimaria: null,
      corSecundaria: null,
      corTerciaria: null,
      urlLogo: null,
      ativa: false,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
      expect(resultado.error.detalhes?.operacao).toBe("LOCATARIO_CONFIGURACAO_CRIAR");
    }
  });
});