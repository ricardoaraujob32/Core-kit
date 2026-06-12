// packages/core/__tests__/assinaturas/cancelarAssinatura.test.ts

import { describe, expect, it } from "vitest";
import { createFnCancelarAssinatura } from "../../src/assinaturas/usecases/cancelarAssinatura";
import { criarAssinaturaTeste, criarAssinaturasSimulacroRepositorio } from "./simulacros/assinaturasSimulacros";
import { DATA_FUTURA, DATA_TESTE, relogioTeste } from "./helpers/assinaturasUsecaseTestUtils";
import { criarPoliticaSegurancaAssinaturasFake } from "./fake/politicaSegurancaAssinaturasFake";

describe("#1 - createFnCancelarAssinatura", () => {
  it("#1.1 - deve cancelar assinatura e registrar encerramento padrão", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "ATIVA",
      }),
    ]);

    const usecase = createFnCancelarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.assinatura.status).toBe("CANCELADA");
      expect(resultado.value.assinatura.encerradaEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve respeitar encerradaEm informado", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "ATIVA",
      }),
    ]);

    const usecase = createFnCancelarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      encerradaEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.assinatura.encerradaEm).toEqual(DATA_FUTURA);
  });

  it("#1.3 - deve falhar quando assinatura não existe", async () => {
    const usecase = createFnCancelarAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-x" });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando assinatura já está cancelada", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "CANCELADA",
      }),
    ]);

    const usecase = createFnCancelarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "ATIVA",
      }),
    ]);
    repo.simularFalha("atualizarAssinatura");

    const usecase = createFnCancelarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar cancelamento de assinatura", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake();

    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        locatarioId: "loc-1",
        status: "ATIVA",
      }),
    ]);

    const usecase = createFnCancelarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      motivo: "cancelamento teste",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "ASSINATURA_CANCELAR",
      locatarioId: "loc-1",
      assinaturaId: "ass-1",
      dados: {
        motivo: "cancelamento teste",
      },
    });
  });

  it("#2.2 - deve bloquear cancelamento quando política negar", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake({ falhar: true });

    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        locatarioId: "loc-1",
        status: "ATIVA",
      }),
    ]);

    const usecase = createFnCancelarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("ASSINATURA_NAO_AUTORIZADA");
  });
});
