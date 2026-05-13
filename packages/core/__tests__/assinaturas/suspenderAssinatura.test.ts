// packages/core/__tests__/assinaturas/suspenderAssinatura.test.ts

import { describe, expect, it } from "vitest";
import { createFnSuspenderAssinatura } from "../../src/assinaturas/usecases/suspenderAssinatura";
import { criarAssinaturaTeste, criarAssinaturasSimulacroRepositorio } from "./simulacros/assinaturasSimulacros";
import { DATA_TESTE, relogioTeste } from "./helpers/assinaturasUsecaseTestUtils";
import { criarPoliticaSegurancaAssinaturasFake } from "./fake/politicaSegurancaAssinaturasFake";

describe("#1 - createFnSuspenderAssinatura", () => {
  it("#1.1 - deve suspender assinatura ATIVA", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "ATIVA",
      }),
    ]);

    const usecase = createFnSuspenderAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.assinatura.status).toBe("SUSPENSA");
      expect(resultado.value.assinatura.atualizadaEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve falhar quando assinatura não existe", async () => {
    const usecase = createFnSuspenderAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-x" });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando transição de estado é inválida", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "RASCUNHO",
      }),
    ]);

    const usecase = createFnSuspenderAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "ATIVA",
      }),
    ]);
    repo.simularFalha("atualizarAssinatura");

    const usecase = createFnSuspenderAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar suspensão de assinatura", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake();

    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        locatarioId: "loc-1",
        status: "ATIVA",
      }),
    ]);

    const usecase = createFnSuspenderAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      motivo: "teste",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "ASSINATURA_SUSPENDER",
      locatarioId: "loc-1",
      assinaturaId: "ass-1",
      dados: { motivo: "teste" },
    });
  });

  it("#2.2 - deve bloquear suspensão quando política negar", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake({ falhar: true });

    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        locatarioId: "loc-1",
        status: "ATIVA",
      }),
    ]);

    const usecase = createFnSuspenderAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("ASSINATURA_NAO_AUTORIZADA");
  });
});
