// packages/core/__tests__/auditoria/listarAuditoriaLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarAuditoriaLocatario } from "../../src/auditoria/usecases/listarAuditoriaLocatario";
import { criarPoliticaSegurancaAuditoriaFake } from "./fake/politicaSegurancaAuditoriaFake";
import {
  criarAuditoriaLocatarioSimulacroRepositorio,
  criarEventoAuditoriaLocatarioTeste,
} from "./simulacros/auditoriaSimulacroRepositorio";

describe("#1 - createFnListarAuditoriaLocatario", () => {
  it("#1.1 - deve listar somente eventos do locatário informado", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio([
      criarEventoAuditoriaLocatarioTeste({ auditoriaId: "aud-1", locatarioId: "loc-1" }),
      criarEventoAuditoriaLocatarioTeste({ auditoriaId: "aud-2", locatarioId: "loc-2" }),
    ]);

    const usecase = createFnListarAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((e) => e.auditoriaId)).toEqual(["aud-1"]);
    }
  });

  it("#1.2 - deve aplicar filtros básicos", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio([
      criarEventoAuditoriaLocatarioTeste({
        auditoriaId: "aud-1",
        locatarioId: "loc-1",
        evento: "usuario.criado",
        categoria: "OPERACAO",
      }),
      criarEventoAuditoriaLocatarioTeste({
        auditoriaId: "aud-2",
        locatarioId: "loc-1",
        evento: "auth.login.sucesso",
        categoria: "SEGURANCA",
      }),
    ]);

    const usecase = createFnListarAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      categoria: "SEGURANCA",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((e) => e.auditoriaId)).toEqual(["aud-2"]);
    }
  });

  it("#1.3 - deve falhar com locatário inválido", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();

    const usecase = createFnListarAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
    });

    const resultado = await usecase({ locatarioId: "" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });

  it("#1.4 - deve propagar falha do repositório", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();
    repo.simularFalha("listarEventos");

    const usecase = createFnListarAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar listagem de auditoria do locatário", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();
    const politica = criarPoliticaSegurancaAuditoriaFake();

    const usecase = createFnListarAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "AUDITORIA_LOCATARIO_LISTAR",
      locatarioId: "loc-1",
    });
  });

  it("#2.2 - deve bloquear listagem quando política negar", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();
    const politica = criarPoliticaSegurancaAuditoriaFake({ falhar: true });

    const usecase = createFnListarAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_NAO_AUTORIZADA");
  });
});