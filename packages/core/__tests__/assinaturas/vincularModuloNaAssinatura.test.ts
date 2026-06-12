// packages/core/__tests__/assinaturas/vincularModuloNaAssinatura.test.ts

import { describe, expect, it } from "vitest";
import { createFnVincularModuloNaAssinatura } from "../../src/assinaturas/usecases/vincularModuloNaAssinatura";
import { criarAssinaturaTeste, criarAssinaturasModulosSimulacroRepositorio, criarAssinaturasSimulacroRepositorio, criarModuloAssinaturaTeste, criarModulosConsultaSimulacroRepositorio,
  } from "./simulacros/assinaturasSimulacros";
import { DATA_TESTE, relogioTeste } from "./helpers/assinaturasUsecaseTestUtils";
import { criarPoliticaSegurancaAssinaturasFake } from "./fake/politicaSegurancaAssinaturasFake";

describe("#1 - createFnVincularModuloNaAssinatura", () => {
  it("#1.1 - deve vincular módulo ativo a uma assinatura existente", async () => {
    const assinaturasRepositorio = criarAssinaturasSimulacroRepositorio([
      criarAssinaturaTeste({ assinaturaId: "ass-1", status: "ATIVA" }),
    ]);

    const assinaturasModulosRepositorio = criarAssinaturasModulosSimulacroRepositorio();

    const modulosConsultaRepositorio = criarModulosConsultaSimulacroRepositorio({
      modulos: [{ moduloId: "mod-1", ativo: true }],
    });

    const usecase = createFnVincularModuloNaAssinatura({
      assinaturasRepositorio,
      assinaturasModulosRepositorio,
      modulosConsultaRepositorio,
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
      expect(resultado.value.origem).toBe("ASSINATURA");
      expect(resultado.value.gratuito).toBe(false);
      expect(resultado.value.habilitadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve falhar quando assinatura não existe", async () => {
    const usecase = createFnVincularModuloNaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        modulos: [{ moduloId: "mod-1", ativo: true }],
      }),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-x",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando módulo não existe", async () => {
    const usecase = createFnVincularModuloNaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({ assinaturaId: "ass-1", status: "ATIVA" }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio(),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-x",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando módulo está inativo", async () => {
    const usecase = createFnVincularModuloNaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({ assinaturaId: "ass-1", status: "ATIVA" }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        modulos: [{ moduloId: "mod-1", ativo: false }],
      }),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve falhar quando módulo já está vinculado ativamente", async () => {
    const usecase = createFnVincularModuloNaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({ assinaturaId: "ass-1", status: "ATIVA" }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio([
        criarModuloAssinaturaTeste({
          assinaturaId: "ass-1",
          moduloId: "mod-1",
          desabilitadoEm: null,
        }),
      ]),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        modulos: [{ moduloId: "mod-1", ativo: true }],
      }),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.6 - deve permitir revincular módulo previamente desabilitado", async () => {
    const assinaturasModulosRepositorio = criarAssinaturasModulosSimulacroRepositorio([
      criarModuloAssinaturaTeste({
        assinaturaId: "ass-1",
        moduloId: "mod-1",
        desabilitadoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnVincularModuloNaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({ assinaturaId: "ass-1", status: "ATIVA" }),
      ]),
      assinaturasModulosRepositorio,
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        modulos: [{ moduloId: "mod-1", ativo: true }],
      }),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(true);
  });

  it("#1.7 - deve propagar falha do repositório ao vincular", async () => {
    const assinaturasModulosRepositorio = criarAssinaturasModulosSimulacroRepositorio();
    assinaturasModulosRepositorio.simularFalha("vincularModulo");

    const usecase = createFnVincularModuloNaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({ assinaturaId: "ass-1", status: "ATIVA" }),
      ]),
      assinaturasModulosRepositorio,
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        modulos: [{ moduloId: "mod-1", ativo: true }],
      }),
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
  it("#2.1 - deve autorizar vínculo de módulo na assinatura", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake();

    const usecase = createFnVincularModuloNaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({
          assinaturaId: "ass-1",
          locatarioId: "loc-1",
          status: "ATIVA",
        }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        modulos: [{ moduloId: "mod-1", ativo: true }],
      }),
      relogio: relogioTeste,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "ASSINATURA_VINCULAR_MODULO",
      locatarioId: "loc-1",
      assinaturaId: "ass-1",
      moduloId: "mod-1",
    });
  });

  it("#2.2 - deve bloquear vínculo quando política negar", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake({ falhar: true });

    const usecase = createFnVincularModuloNaAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({
          assinaturaId: "ass-1",
          locatarioId: "loc-1",
          status: "ATIVA",
        }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        modulos: [{ moduloId: "mod-1", ativo: true }],
      }),
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
