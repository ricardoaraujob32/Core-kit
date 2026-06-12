// packages/core/__tests__/locatarios/obterLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnObterLocatario } from "../../src/locatarios/usecases/obterLocatario";
import { criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";

describe("#1 - createFnObterLocatario", () => {
  it("#1.1 - deve obter locatário ativo", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);

    const usecase = createFnObterLocatario({ locatariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.locatario.locatarioId).toBe("loc-1");
  });

  it("#1.2 - deve falhar quando locatário não existe", async () => {
    const repo = criarLocatariosSimulacroRepositorio();
    const usecase = createFnObterLocatario({ locatariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-x" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando locatário está suspenso", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "SUSPENSO" }),
    ]);

    const usecase = createFnObterLocatario({ locatariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_SUSPENSO");
  });

  it("#1.4 - deve falhar quando locatário está encerrado", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ENCERRADO" }),
    ]);

    const usecase = createFnObterLocatario({ locatariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_ENCERRADO");
  });

  it("#1.5 - deve propagar falha do repositório", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    repo.simularFalha("buscarPorId");

    const usecase = createFnObterLocatario({ locatariosRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de obter locatário", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake();

    const usecase = createFnObterLocatario({
      locatariosRepositorio: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "LOCATARIO_OBTER",
      locatarioId: "loc-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar obtenção", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake({ autorizado: false });

    const usecase = createFnObterLocatario({
      locatariosRepositorio: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
      expect(resultado.error.detalhes?.operacao).toBe("LOCATARIO_OBTER");
    }
  });
});