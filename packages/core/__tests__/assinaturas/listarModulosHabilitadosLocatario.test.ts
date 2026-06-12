// packages/core/__tests__/assinaturas/listarModulosHabilitadosLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarModulosHabilitadosLocatario } from "../../src/assinaturas/usecases/listarModulosHabilitadosLocatario";
import { criarAssinaturaTeste, criarAssinaturasModulosSimulacroRepositorio, criarAssinaturasSimulacroRepositorio, criarModuloAssinaturaTeste, criarModulosConsultaSimulacroRepositorio 
  } from "./simulacros/assinaturasSimulacros";
import { criarPoliticaSegurancaAssinaturasFake } from "./fake/politicaSegurancaAssinaturasFake";

describe("#1 - createFnListarModulosHabilitadosLocatario", () => {
  it("#1.1 - deve listar módulos gratuitos mesmo sem assinatura ativa", async () => {
    const usecase = createFnListarModulosHabilitadosLocatario({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        gratis: [{ moduloId: "mod-gratis" }],
      }),
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.assinaturaAtiva).toBeNull();
      expect(resultado.value.modulos).toEqual([
        {
          moduloId: "mod-gratis",
          origem: "GRATUITO",
          gratuito: true,
        },
      ]);
    }
  });

  it("#1.2 - deve combinar módulos gratuitos com módulos de assinatura ativa", async () => {
    const usecase = createFnListarModulosHabilitadosLocatario({
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
          moduloId: "mod-pago",
          gratuito: false,
          origem: "ASSINATURA",
        }),
      ]),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        gratis: [{ moduloId: "mod-gratis" }],
      }),
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.modulos.map((item) => item.moduloId).sort()).toEqual([
        "mod-gratis",
        "mod-pago",
      ]);
    }
  });

  it("#1.3 - deve priorizar origem ASSINATURA quando módulo gratuito também está vinculado", async () => {
    const usecase = createFnListarModulosHabilitadosLocatario({
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
          moduloId: "mod-duplicado",
          gratuito: false,
          origem: "ASSINATURA",
        }),
      ]),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        gratis: [{ moduloId: "mod-duplicado" }],
      }),
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.modulos).toHaveLength(1);
      expect(resultado.value.modulos[0]).toEqual({
        moduloId: "mod-duplicado",
        origem: "ASSINATURA",
        gratuito: false,
      });
    }
  });

  it("#1.4 - deve ignorar módulos de assinatura quando assinatura está SUSPENSA", async () => {
    const usecase = createFnListarModulosHabilitadosLocatario({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({
          assinaturaId: "ass-1",
          locatarioId: "loc-1",
          status: "SUSPENSA",
        }),
      ]),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio([
        criarModuloAssinaturaTeste({
          assinaturaId: "ass-1",
          moduloId: "mod-pago",
        }),
      ]),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        gratis: [{ moduloId: "mod-gratis" }],
      }),
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.assinaturaAtiva?.status).toBe("SUSPENSA");
      expect(resultado.value.modulos.map((item) => item.moduloId)).toEqual(["mod-gratis"]);
    }
  });

  it("#1.5 - deve propagar falha ao buscar assinatura ativa", async () => {
    const assinaturasRepositorio = criarAssinaturasSimulacroRepositorio();
    assinaturasRepositorio.simularFalha("buscarAssinaturaAtivaPorLocatario");

    const usecase = createFnListarModulosHabilitadosLocatario({
      assinaturasRepositorio,
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio(),
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });

  it("#1.6 - deve propagar falha ao listar módulos gratuitos", async () => {
    const modulosConsultaRepositorio = criarModulosConsultaSimulacroRepositorio();
    modulosConsultaRepositorio.simularFalha("listarModulosGratis");

    const usecase = createFnListarModulosHabilitadosLocatario({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });

  it("#1.7 - deve propagar falha ao listar módulos da assinatura ativa", async () => {
    const assinaturasModulosRepositorio = criarAssinaturasModulosSimulacroRepositorio();
    assinaturasModulosRepositorio.simularFalha("listarModulosAtivosDaAssinatura");

    const usecase = createFnListarModulosHabilitadosLocatario({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({
          assinaturaId: "ass-1",
          locatarioId: "loc-1",
          status: "ATIVA",
        }),
      ]),
      assinaturasModulosRepositorio,
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio(),
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar listagem de módulos habilitados do locatário", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake();

    const usecase = createFnListarModulosHabilitadosLocatario({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio({
        gratis: [{ moduloId: "mod-gratis" }],
      }),
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "ASSINATURA_LISTAR_MODULOS",
      locatarioId: "loc-1",
    });
  });

  it("#2.2 - deve bloquear listagem quando política negar", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake({ falhar: true });

    const usecase = createFnListarModulosHabilitadosLocatario({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      assinaturasModulosRepositorio: criarAssinaturasModulosSimulacroRepositorio(),
      modulosConsultaRepositorio: criarModulosConsultaSimulacroRepositorio(),
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("ASSINATURA_NAO_AUTORIZADA");
  });
});
