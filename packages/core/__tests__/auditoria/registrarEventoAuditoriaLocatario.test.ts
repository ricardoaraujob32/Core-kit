// packages/core/__tests__/auditoria/registrarEventoAuditoriaLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnRegistrarEventoAuditoriaLocatario } from "../../src/auditoria/usecases/registrarEventoAuditoriaLocatario";
import { criarPoliticaSegurancaAuditoriaFake } from "./fake/politicaSegurancaAuditoriaFake";
import { criarAuditoriaLocatarioSimulacroRepositorio } from "./simulacros/auditoriaSimulacroRepositorio";

describe("#1 - createFnRegistrarEventoAuditoriaLocatario", () => {
  it("#1.1 - deve registrar evento de locatário mapeado", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();

    const usecase = createFnRegistrarEventoAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      evento: "usuario.criado",
      sucesso: true,
      entidadeTipo: "usuario",
      entidadeId: "usr-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.evento.evento).toBe("usuario.criado");
      expect(resultado.value.evento.categoria).toBe("OPERACAO");
      expect(resultado.value.evento.locatarioId).toBe("loc-1");
      expect(resultado.value.evento.origem).toBe("API");
    }
  });

  it("#1.2 - deve falhar quando evento não é mapeado", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();

    const usecase = createFnRegistrarEventoAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      evento: "evento.inexistente",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });

  it("#1.3 - deve falhar quando evento é de plataforma", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();

    const usecase = createFnRegistrarEventoAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      evento: "plataforma.locatario.listado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });

  it("#1.4 - deve propagar falha do repositório", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();
    repo.simularFalha("registrarEvento");

    const usecase = createFnRegistrarEventoAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      evento: "usuario.criado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar registro de auditoria do locatário", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();
    const politica = criarPoliticaSegurancaAuditoriaFake();

    const usecase = createFnRegistrarEventoAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      evento: "usuario.criado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "AUDITORIA_LOCATARIO_REGISTRAR",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      evento: "usuario.criado",
    });
  });

  it("#2.2 - deve bloquear registro quando política negar", async () => {
    const repo = criarAuditoriaLocatarioSimulacroRepositorio();
    const politica = criarPoliticaSegurancaAuditoriaFake({ falhar: true });

    const usecase = createFnRegistrarEventoAuditoriaLocatario({
      auditoriaLocatarioRepositorio: repo,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      evento: "usuario.criado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_NAO_AUTORIZADA");
  });
});
