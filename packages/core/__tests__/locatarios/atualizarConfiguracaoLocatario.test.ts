// packages/core/__tests__/locatarios/atualizarConfiguracaoLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnAtualizarConfiguracaoLocatario } from "../../src/locatarios/usecases/atualizarConfiguracaoLocatario";
import { criarConfiguracaoLocatarioTeste, criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { relogioTeste } from "./helpers/locatariosUsecaseTestUtils";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";

describe("#1 - createFnAtualizarConfiguracaoLocatario", () => {
  it("#1.1 - deve atualizar configuração existente", async () => {
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

  it("#1.2 - deve falhar quando locatário não existe", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnAtualizarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-x",
      configuracaoId: "cfg-1",
      identidadeVisual: "Identidade Atualizada",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando configuração não existe", async () => {
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
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_INVALIDO");
  });

  it("#1.4 - deve propagar falha do repositório ao atualizar configuração", async () => {
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

    repo.simularFalha("atualizarConfiguracao");

    const usecase = createFnAtualizarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-1",
      identidadeVisual: "Identidade Atualizada",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de atualizar configuração", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({
        locatarioId: "loc-1",
        status: "ATIVO",
        configuracoes: [
          criarConfiguracaoLocatarioTeste({
            configuracaoId: "cfg-1",
            locatarioId: "loc-1",
          }),
        ],
      }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake();

    const usecase = createFnAtualizarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-1",
      identidadeVisual: "identidade-atualizada",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "LOCATARIO_CONFIGURACAO_ATUALIZAR",
      locatarioId: "loc-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar atualização de configuração", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({
        locatarioId: "loc-1",
        status: "ATIVO",
        configuracoes: [
          criarConfiguracaoLocatarioTeste({
            configuracaoId: "cfg-1",
            locatarioId: "loc-1",
          }),
        ],
      }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake({ autorizado: false });

    const usecase = createFnAtualizarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-1",
      identidadeVisual: "identidade-atualizada",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
      expect(resultado.error.detalhes?.operacao).toBe("LOCATARIO_CONFIGURACAO_ATUALIZAR");
    }
  });
});