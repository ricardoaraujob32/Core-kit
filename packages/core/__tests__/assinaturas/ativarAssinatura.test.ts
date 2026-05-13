// packages/core/__tests__/assinaturas/ativarAssinatura.test.ts

import { describe, expect, it } from "vitest";
import { createFnAtivarAssinatura } from "../../src/assinaturas/usecases/ativarAssinatura";
import { criarAssinaturaTeste, criarAssinaturasSimulacroRepositorio } from "./simulacros/assinaturasSimulacros";
import { DATA_TESTE, relogioTeste } from "./helpers/assinaturasUsecaseTestUtils";
import { criarPoliticaSegurancaAssinaturasFake } from "./fake/politicaSegurancaAssinaturasFake";

describe("#1 - createFnAtivarAssinatura", () => {
  it("#1.1 - deve ativar assinatura em RASCUNHO", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "RASCUNHO",
      }),
    ]);

    const usecase = createFnAtivarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.assinatura.status).toBe("ATIVA");
      expect(resultado.value.assinatura.atualizadaEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve ativar assinatura SUSPENSA", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "SUSPENSA",
      }),
    ]);

    const usecase = createFnAtivarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.assinatura.status).toBe("ATIVA");
  });

  it("#1.3 - deve falhar quando assinatura não existe", async () => {
    const usecase = createFnAtivarAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-x" });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando transição de estado é inválida", async () => {
    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        status: "CANCELADA",
      }),
    ]);

    const usecase = createFnAtivarAssinatura({
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
        status: "RASCUNHO",
      }),
    ]);
    repo.simularFalha("atualizarAssinatura");

    const usecase = createFnAtivarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar ativação de assinatura", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake();

    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        locatarioId: "loc-1",
        status: "RASCUNHO",
      }),
    ]);

    const usecase = createFnAtivarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "ASSINATURA_ATIVAR",
      locatarioId: "loc-1",
      assinaturaId: "ass-1",
    });
  });

  it("#2.2 - deve bloquear ativação quando política negar", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake({ falhar: true });

    const repo = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({
        assinaturaId: "ass-1",
        locatarioId: "loc-1",
        status: "RASCUNHO",
      }),
    ]);

    const usecase = createFnAtivarAssinatura({
      assinaturasRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({ assinaturaId: "ass-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("ASSINATURA_NAO_AUTORIZADA");
  });
});
