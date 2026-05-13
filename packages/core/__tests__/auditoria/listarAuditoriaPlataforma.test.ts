// packages/core/__tests__/auditoria/listarAuditoriaPlataforma.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarAuditoriaPlataforma } from "../../src/auditoria/usecases/listarAuditoriaPlataforma";
import { criarPoliticaSegurancaAuditoriaFake } from "./fake/politicaSegurancaAuditoriaFake";
import {
  criarAuditoriaPlataformaSimulacroRepositorio,
  criarEventoAuditoriaPlataformaTeste,
} from "./simulacros/auditoriaSimulacroRepositorio";

describe("#1 - createFnListarAuditoriaPlataforma", () => {
  it("#1.1 - deve listar eventos de plataforma", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio([
      criarEventoAuditoriaPlataformaTeste({ auditoriaId: "aud-1" }),
      criarEventoAuditoriaPlataformaTeste({ auditoriaId: "aud-2" }),
    ]);

    const usecase = createFnListarAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
    });

    const resultado = await usecase({});

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((e) => e.auditoriaId)).toEqual([
        "aud-1",
        "aud-2",
      ]);
    }
  });

  it("#1.2 - deve filtrar por superadmin", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio([
      criarEventoAuditoriaPlataformaTeste({
        auditoriaId: "aud-1",
        superadminUsuarioId: "super-1",
      }),
      criarEventoAuditoriaPlataformaTeste({
        auditoriaId: "aud-2",
        superadminUsuarioId: "super-2",
      }),
    ]);

    const usecase = createFnListarAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
    });

    const resultado = await usecase({
      superadminUsuarioId: "super-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((e) => e.auditoriaId)).toEqual(["aud-1"]);
    }
  });

  it("#1.3 - deve falhar com limite inválido", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();

    const usecase = createFnListarAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
    });

    const resultado = await usecase({ limite: 501 });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });

  it("#1.4 - deve propagar falha do repositório", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();
    repo.simularFalha("listarEventos");

    const usecase = createFnListarAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
    });

    const resultado = await usecase({});

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar listagem de auditoria de plataforma", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();
    const politica = criarPoliticaSegurancaAuditoriaFake();

    const usecase = createFnListarAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      superadminUsuarioId: "super-1",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "AUDITORIA_PLATAFORMA_LISTAR",
      superadminUsuarioId: "super-1",
    });
  });

  it("#2.2 - deve bloquear listagem quando política negar", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();
    const politica = criarPoliticaSegurancaAuditoriaFake({ falhar: true });

    const usecase = createFnListarAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({});

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_NAO_AUTORIZADA");
  });
});