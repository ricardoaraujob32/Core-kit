// packages/core/__tests__/assinaturas/desvincularModuloDaAssinatura.test.ts

import { describe, expect, it } from "vitest";
import { createFnDesvincularModuloDaAssinatura } from "../../src/assinaturas/usecases/desvincularModuloDaAssinatura";
import { criarAssinaturaTeste, criarAssinaturasModulosSimulacroRepositorio, criarAssinaturasSimulacroRepositorio, criarModuloAssinaturaTeste } from "./simulacros/assinaturasSimulacros";
import { DATA_TESTE, relogioTeste } from "./helpers/assinaturasUsecaseTestUtils";
import { criarPoliticaSegurancaAssinaturasFake } from "./fake/politicaSegurancaAssinaturasFake";

describe("#1 - createFnDesvincularModuloDaAssinatura", () => {
  it("#1.1 - deve desvincular módulo ativo de assinatura existente", async () => {
    const assinaturasModulosRepositorio = criarAssinaturasModulosSimulacroRepositorio([
      criarModuloAssinaturaTeste({
        assinaturaId: "ass-1",
        moduloId: "mod-1",
        desabilitadoEm: null,
      }),
    ]);

    const usecase = createFnDesvincularModuloDaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({ assinaturaId: "ass-1" }),
      ]),
      assinaturasModulosRepositorio,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.assinaturaId).toBe("ass-1");
      expect(resultado.value.moduloId).toBe("mod-1");
      expect(resultado.value.desabilitadoEm).toEqual(DATA_TESTE);
    }

    expect(assinaturasModulosRepositorio.dump()[0]?.desabilitadoEm).toEqual(DATA_TESTE);
  });

  it("#1.2 - deve falhar quando assinatura não existe", async () => {
    const usecase = createFnDesvincularModuloDaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-x",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando módulo não está vinculado", async () => {
    const usecase = createFnDesvincularModuloDaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({ assinaturaId: "ass-1" }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-x",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando vínculo já está desabilitado", async () => {
    const usecase = createFnDesvincularModuloDaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({ assinaturaId: "ass-1" }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio([
        criarModuloAssinaturaTeste({
          assinaturaId: "ass-1",
          moduloId: "mod-1",
          desabilitadoEm: new Date("2026-01-02T00:00:00.000Z"),
        }),
      ]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao desvincular", async () => {
    const assinaturasModulosRepositorio = criarAssinaturasModulosSimulacroRepositorio([
      criarModuloAssinaturaTeste({
        assinaturaId: "ass-1",
        moduloId: "mod-1",
        desabilitadoEm: null,
      }),
    ]);
    assinaturasModulosRepositorio.simularFalha("desvincularModulo");

    const usecase = createFnDesvincularModuloDaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({ assinaturaId: "ass-1" }),
      ]),
      assinaturasModulosRepositorio,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar desvínculo de módulo da assinatura", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake();

    const usecase = createFnDesvincularModuloDaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({
          assinaturaId: "ass-1",
          locatarioId: "loc-1",
          status: "ATIVA",
        }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio([
        criarModuloAssinaturaTeste({
          assinaturaId: "ass-1",
          moduloId: "mod-1",
          desabilitadoEm: null,
        }),
      ]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "ASSINATURA_DESVINCULAR_MODULO",
      locatarioId: "loc-1",
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });
  });

  it("#2.2 - deve bloquear desvínculo quando política negar", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake({ falhar: true });

    const usecase = createFnDesvincularModuloDaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({
          assinaturaId: "ass-1",
          locatarioId: "loc-1",
          status: "ATIVA",
        }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio([
        criarModuloAssinaturaTeste({
          assinaturaId: "ass-1",
          moduloId: "mod-1",
          desabilitadoEm: null,
        }),
      ]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("ASSINATURA_NAO_AUTORIZADA");
  });
});
