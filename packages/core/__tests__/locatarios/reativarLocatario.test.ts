// packages/core/__tests__/locatarios/reativarLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnReativarLocatario } from "../../src/locatarios/usecases/reativarLocatario";
import { criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";
import { relogioTeste } from "./helpers/locatariosUsecaseTestUtils";

describe("#1 - createFnReativarLocatario", () => {
  it("#1.1 - deve reativar locatário suspenso", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "SUSPENSO" }),
    ]);

    const usecase = createFnReativarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      motivoReativacao: " pagamento regularizado ",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.locatario.status).toBe("ATIVO");
      expect(resultado.value.locatario.reativadoEm).toEqual(relogioTeste.agora());
      expect(resultado.value.locatario.motivoReativacao).toBe("pagamento regularizado");
    }
  });

  it("#1.2 - deve falhar quando locatário não existe", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnReativarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-x" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando locatário já está ativo", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);

    const usecase = createFnReativarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "SUSPENSO" }),
    ]);

    repo.simularFalha("atualizar");

    const usecase = createFnReativarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de reativar locatário", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "SUSPENSO" }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake();

    const usecase = createFnReativarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      motivoReativacao: "regularizado",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "LOCATARIO_REATIVAR",
      locatarioId: "loc-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar reativação", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "SUSPENSO" }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake({ autorizado: false });

    const usecase = createFnReativarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      motivoReativacao: "regularizado",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
      expect(resultado.error.detalhes?.operacao).toBe("LOCATARIO_REATIVAR");
    }
  });
});