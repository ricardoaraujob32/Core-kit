// packages/core/__tests__/locatarios/ativarConfiguracaoLocatario.test.ts

import { describe, expect, it } from "vitest";
import { createFnAtivarConfiguracaoLocatario } from "../../src/locatarios/usecases/ativarConfiguracaoLocatario";
import { criarConfiguracaoLocatarioTeste, criarLocatarioTeste, criarLocatariosSimulacroRepositorio } from "./simulacros/locatariosSimulacroRepositorio";
import { relogioTeste } from "./helpers/locatariosUsecaseTestUtils";
import { criarPoliticaSegurancaLocatariosFake } from "./fake/politicaSegurancaLocatariosFake";

describe("#1 - createFnAtivarConfiguracaoLocatario", () => {
  it("#1.1 - deve ativar configuração e desativar configuração anterior", async () => {
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

  it("#1.2 - deve falhar quando locatário não existe", async () => {
    const repo = criarLocatariosSimulacroRepositorio();

    const usecase = createFnAtivarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-x",
      configuracaoId: "cfg-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_NAO_ENCONTRADO");
  });

  it("#1.3 - deve falhar quando configuração não existe", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({ locatarioId: "loc-1" }),
    ]);

    const usecase = createFnAtivarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-x",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("LOCATARIO_INVALIDO");
  });

  it("#1.4 - deve propagar falha do repositório ao desativar configuração ativa", async () => {
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

    repo.simularFalha("desativarConfiguracoesAtivas");

    const usecase = createFnAtivarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-2",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de ativar configuração", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({
        locatarioId: "loc-1",
        status: "ATIVO",
        configuracoes: [
          criarConfiguracaoLocatarioTeste({
            configuracaoId: "cfg-1",
            locatarioId: "loc-1",
            ativa: false,
          }),
        ],
      }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake();

    const usecase = createFnAtivarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-1",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "LOCATARIO_CONFIGURACAO_ATIVAR",
      locatarioId: "loc-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar ativação de configuração", async () => {
    const repo = criarLocatariosSimulacroRepositorio([
      criarLocatarioTeste({
        locatarioId: "loc-1",
        status: "ATIVO",
        configuracoes: [
          criarConfiguracaoLocatarioTeste({
            configuracaoId: "cfg-1",
            locatarioId: "loc-1",
            ativa: false,
          }),
        ],
      }),
    ]);
    const politica = criarPoliticaSegurancaLocatariosFake({ autorizado: false });

    const usecase = createFnAtivarConfiguracaoLocatario({
      locatariosRepositorio: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      configuracaoId: "cfg-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
      expect(resultado.error.detalhes?.operacao).toBe("LOCATARIO_CONFIGURACAO_ATIVAR");
    }
  });
});
