// packages/core/__tests__/locatarios/encerrarLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnEncerrarLocatario } from "../../src/locatarios/usecases/encerrarLocatario";
import { criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { relogioTeste } from "./helpers/locatariosUsecaseTestUtils";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";

describe("#1 - createFnEncerrarLocatario", () => {
  it("#1.1 - deve encerrar locatário ativo", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);

    const usecase = createFnEncerrarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      motivoExclusao: " encerramento solicitado ",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.locatario.status).toBe("ENCERRADO");
      expect(resultado.value.locatario.excluidoEm).toEqual(relogioTeste.agora());
      expect(resultado.value.locatario.motivoExclusao).toBe("encerramento solicitado");
    }
  });

  it("#1.2 - deve falhar quando locatário não existe", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnEncerrarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-x" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando a transição de estado for inválida", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ENCERRADO" }),
    ]);

    const usecase = createFnEncerrarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);

    repo.simularFalha("atualizar");

    const usecase = createFnEncerrarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de encerrar locatário", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake();

    const usecase = createFnEncerrarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      motivoExclusao: "encerramento contratual",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "LOCATARIO_ENCERRAR",
      locatarioId: "loc-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar encerramento", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake({ autorizado: false });

    const usecase = createFnEncerrarLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      motivoExclusao: "encerramento contratual",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
      expect(resultado.error.detalhes?.operacao).toBe("LOCATARIO_ENCERRAR");
    }
  });
});