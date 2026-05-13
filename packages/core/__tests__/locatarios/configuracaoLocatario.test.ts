// packages/core/__tests__/locatarios/configuracaoLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnAtivarConfiguracaoLocatario } from "../../src/locatarios/usecases/ativarConfiguracaoLocatario";
import { createFnAtualizarConfiguracaoLocatario } from "../../src/locatarios/usecases/atualizarConfiguracaoLocatario";
import { createFnCriarConfiguracaoLocatario } from "../../src/locatarios/usecases/criarConfiguracaoLocatario";
import { criarConfiguracaoLocatarioTeste, criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { criarIdPortaSequencial, relogioTeste } from "./helpers/locatariosUsecaseTestUtils";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";

describe("#1 - casos de uso de configuração do locatário", () => {
  it("#1.1 - deve criar nova configuração inativa", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1" }),
    ]);

    const usecase = createFnCriarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cfg-2"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      modoTema: "CLARO",
      identidadeVisual: "Nova Identidade",
      corPrimaria: "#111111",
      corSecundaria: "#222222",
      corTerciaria: "#333333",
      urlLogo: null,
      ativa: false,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.configuracaoId).toBe("cfg-2");
    }
  });

  it("#1.2 - deve falhar ao criar configuração para locatário inexistente", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnCriarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      idPorta: criarIdPortaSequencial(["cfg-2"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-x",
      modoTema: "CLARO",
      identidadeVisual: "Nova Identidade",
      corPrimaria: "#111111",
      corSecundaria: "#222222",
      corTerciaria: "#333333",
      urlLogo: null,
      ativa: false,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("LOCATARIO_NAO_ENCONTRADO");
    }
  });

  it("#1.3 - deve atualizar configuração existente", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({
        locatarioId: "loc-1",
        configuracoes: [
          criarConfiguracaoLocatarioTeste({
            locatarioId: "loc-1",
            configuracaoId: "cfg-1",
            ativa: true,
          }),
        ],
      }),
    ]);

    const usecase = createFnAtualizarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-1",
      identidadeVisual: "Identidade Atualizada",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.configuracao.identidadeVisual).toBe("Identidade Atualizada");
      expect(resultado.value.configuracao.atualizadoEm).toEqual(relogioTeste.agora());
    }
  });

  it("#1.4 - deve falhar ao atualizar configuração inexistente", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1" }),
    ]);

    const usecase = createFnAtualizarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-x",
      identidadeVisual: "Identidade Atualizada",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("LOCATARIO_INVALIDO");
    }
  });

  it("#1.5 - deve ativar configuração e desativar a configuração anterior", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({
        locatarioId: "loc-1",
        configuracoes: [
          criarConfiguracaoLocatarioTeste({
            locatarioId: "loc-1",
            configuracaoId: "cfg-1",
            ativa: true,
          }),
          criarConfiguracaoLocatarioTeste({
            locatarioId: "loc-1",
            configuracaoId: "cfg-2",
            ativa: false,
          }),
        ],
      }),
    ]);

    const usecase = createFnAtivarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-2",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.configuracao.configuracaoId).toBe("cfg-2");
      expect(resultado.value.configuracao.ativa).toBe(true);
    }

    const configs = await repo.listarConfiguracoes({ locatarioId: "loc-1" });

    expect(configs.ok).toBe(true);
    if (configs.ok) {
      expect(configs.value.find((c) => c.configuracaoId === "cfg-1")?.ativa).toBe(false);
      expect(configs.value.find((c) => c.configuracaoId === "cfg-2")?.ativa).toBe(true);
    }
  });
});

describe("#2 - política de segurança", () => {
  it.todo("#2.1 - deve negar execução quando o contexto não possui usuário autenticado");

  it.todo("#2.2 - deve negar execução quando o usuário não pertence ao locatário informado");

  it.todo("#2.3 - deve negar execução quando o contexto não possui a permissão exigida");

  it.todo("#2.4 - deve permitir execução quando o contexto possui a permissão exigida");
});