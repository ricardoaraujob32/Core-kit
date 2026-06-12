// packages/core/__tests__/assinaturas/criarAssinatura.test.ts

import { describe, expect, it } from "vitest";
import { createFnCriarAssinatura } from "../../src/assinaturas/usecases/criarAssinatura";
import { criarAssinaturaTeste, criarAssinaturasSimulacroRepositorio, criarPlanosConsultaSimulacroRepositorio } from "./simulacros/assinaturasSimulacros";
import { criarIdPortaSequencial, DATA_TESTE, relogioTeste } from "./helpers/assinaturasUsecaseTestUtils";
import { criarPoliticaSegurancaAssinaturasFake } from "./fake/politicaSegurancaAssinaturasFake";

describe("#1 - createFnCriarAssinatura", () => {
  it("#1.1 - deve criar assinatura em RASCUNHO quando plano é válido e não há assinatura existente", async () => {
    const assinaturasRepositorio = criarAssinaturasSimulacroRepositorio();
    const planosConsultaRepositorio = criarPlanosConsultaSimulacroRepositorio([
      { planoId: "plano-1", ativo: true },
    ]);

    const usecase = createFnCriarAssinatura({
      assinaturasRepositorio,
      planosConsultaRepositorio,
      relogio: relogioTeste,
      idPorta: criarIdPortaSequencial(["ass-1"]),
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      planoId: "plano-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.assinatura.assinaturaId).toBe("ass-1");
      expect(resultado.value.assinatura.status).toBe("RASCUNHO");
      expect(resultado.value.assinatura.criadaEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve falhar quando plano não existe", async () => {
    const usecase = createFnCriarAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      planosConsultaRepositorio: criarPlanosConsultaSimulacroRepositorio(),
      relogio: relogioTeste,
      idPorta: criarIdPortaSequencial(["ass-1"]),
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      planoId: "plano-x",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando plano está inativo", async () => {
    const usecase = createFnCriarAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      planosConsultaRepositorio: criarPlanosConsultaSimulacroRepositorio([
        { planoId: "plano-1", ativo: false },
      ]),
      relogio: relogioTeste,
      idPorta: criarIdPortaSequencial(["ass-1"]),
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      planoId: "plano-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando já existe assinatura operacional para o locatário", async () => {
    const usecase = createFnCriarAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio([
        criarAssinaturaTeste({
          assinaturaId: "ass-existente",
          locatarioId: "loc-1",
          status: "ATIVA",
        }),
      ]),
      planosConsultaRepositorio: criarPlanosConsultaSimulacroRepositorio([
        { planoId: "plano-1", ativo: true },
      ]),
      relogio: relogioTeste,
      idPorta: criarIdPortaSequencial(["ass-1"]),
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      planoId: "plano-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao consultar plano", async () => {
    const planosConsultaRepositorio = criarPlanosConsultaSimulacroRepositorio();
    planosConsultaRepositorio.simularFalha("validarPlanoAtivo");

    const usecase = createFnCriarAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      planosConsultaRepositorio,
      relogio: relogioTeste,
      idPorta: criarIdPortaSequencial(["ass-1"]),
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      planoId: "plano-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar criação de assinatura", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake();

    const usecase = createFnCriarAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      planosConsultaRepositorio: criarPlanosConsultaSimulacroRepositorio([
        { planoId: "plano-1", ativo: true },
      ]),
      relogio: relogioTeste,
      idPorta: criarIdPortaSequencial(["ass-1"]),
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      planoId: "plano-1",
    });

    expect(resultado.ok).toBe(true);

    expect(politica.chamadas()).toBe(1);

    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "ASSINATURA_CRIAR",
      locatarioId: "loc-1",
      planoId: "plano-1",
    });
  });

  it("#2.2 - deve bloquear criação quando política negar", async () => {
    const politica = criarPoliticaSegurancaAssinaturasFake({
      falhar: true,
    });

    const usecase = createFnCriarAssinatura({
      assinaturasRepositorio: criarAssinaturasSimulacroRepositorio(),
      planosConsultaRepositorio: criarPlanosConsultaSimulacroRepositorio([
        { planoId: "plano-1", ativo: true },
      ]),
      relogio: relogioTeste,
      idPorta: criarIdPortaSequencial(["ass-1"]),
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      planoId: "plano-1",
    });

    expect(resultado.ok).toBe(false);

    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe(
        "ASSINATURA_NAO_AUTORIZADA",
      );
    }
  });
});
