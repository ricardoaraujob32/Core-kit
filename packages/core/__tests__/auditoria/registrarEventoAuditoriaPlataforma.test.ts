// packages/core/__tests__/auditoria/registrarEventoAuditoriaPlataforma.test.ts

import { describe, expect, it } from "vitest";
import { createFnRegistrarEventoAuditoriaPlataforma } from "../../src/auditoria/usecases/registrarEventoAuditoriaPlataforma";
import { criarPoliticaSegurancaAuditoriaFake } from "./fake/politicaSegurancaAuditoriaFake";
import { criarAuditoriaPlataformaSimulacroRepositorio } from "./simulacros/auditoriaSimulacroRepositorio";

describe("#1 - createFnRegistrarEventoAuditoriaPlataforma", () => {
  it("#1.1 - deve registrar evento de plataforma mapeado", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();

    const usecase = createFnRegistrarEventoAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
    });

    const resultado = await usecase({
      superadminUsuarioId: "super-1",
      evento: "plataforma.locatario.listado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.evento.evento).toBe("plataforma.locatario.listado");
      expect(resultado.value.evento.categoria).toBe("OPERACAO");
      expect(resultado.value.evento.superadminUsuarioId).toBe("super-1");
    }
  });

  it("#1.2 - deve falhar quando evento não é mapeado", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();

    const usecase = createFnRegistrarEventoAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
    });

    const resultado = await usecase({
      superadminUsuarioId: "super-1",
      evento: "evento.inexistente",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });

  it("#1.3 - deve falhar quando evento é de locatário", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();

    const usecase = createFnRegistrarEventoAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
    });

    const resultado = await usecase({
      superadminUsuarioId: "super-1",
      evento: "usuario.criado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });

  it("#1.4 - deve exigir locatário alvo quando evento exigir", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();

    const usecase = createFnRegistrarEventoAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
    });

    const resultado = await usecase({
      superadminUsuarioId: "super-1",
      evento: "plataforma.locatario.criado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_INVALIDA");
  });

  it("#1.5 - deve propagar falha do repositório", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();
    repo.simularFalha("registrarEvento");

    const usecase = createFnRegistrarEventoAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
    });

    const resultado = await usecase({
      superadminUsuarioId: "super-1",
      evento: "plataforma.locatario.listado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar registro de auditoria de plataforma", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();
    const politica = criarPoliticaSegurancaAuditoriaFake();

    const usecase = createFnRegistrarEventoAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      superadminUsuarioId: "super-1",
      evento: "plataforma.locatario.listado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaEntrada()).toMatchObject({
      operacao: "AUDITORIA_PLATAFORMA_REGISTRAR",
      superadminUsuarioId: "super-1",
      evento: "plataforma.locatario.listado",
    });
  });

  it("#2.2 - deve bloquear registro quando política negar", async () => {
    const repo = criarAuditoriaPlataformaSimulacroRepositorio();
    const politica = criarPoliticaSegurancaAuditoriaFake({ falhar: true });

    const usecase = createFnRegistrarEventoAuditoriaPlataforma({
      auditoriaPlataformaRepositorio: repo,
      politicaSeguranca: politica.politica,
    });

    const resultado = await usecase({
      superadminUsuarioId: "super-1",
      evento: "plataforma.locatario.listado",
      sucesso: true,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("AUDITORIA_NAO_AUTORIZADA");
  });
});