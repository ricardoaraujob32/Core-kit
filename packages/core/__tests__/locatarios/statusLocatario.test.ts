// packages/core/__tests__/locatarios/statusLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnEncerrarLocatario } from "../../src/locatarios/usecases/encerrarLocatario";
import { createFnReativarLocatario } from "../../src/locatarios/usecases/reativarLocatario";
import { createFnSuspenderLocatario } from "../../src/locatarios/usecases/suspenderLocatario";
import { criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";
import { relogioTeste } from "./helpers/locatariosUsecaseTestUtils";

describe("#1 - casos de uso de status do locatário", () => {
  it("#1.1 - deve suspender locatário ativo", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1", status: "ATIVO" }),
    ]);

    const usecase = createFnSuspenderLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      motivoSuspensao: " inadimplência ",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.locatario.status).toBe("SUSPENSO");
      expect(resultado.value.locatario.suspensoEm).toEqual(relogioTeste.agora());
      expect(resultado.value.locatario.motivoSuspensao).toBe("inadimplência");
    }
  });

  it("#1.2 - deve reativar locatário suspenso", async () => {
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

  it("#1.3 - deve encerrar locatário ativo", async () => {
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

  it("#1.4 - deve falhar ao reativar locatário ativo", async () => {
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

  it("#1.5 - deve falhar quando locatário não existe ao suspender", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnSuspenderLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-x" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("LOCATARIO_NAO_ENCONTRADO");
    }
  });
});
