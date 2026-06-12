// packages/core/__tests__/tokens/listarTokensDoUsuario.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarTokensDoUsuario } from "../../src/tokens/usecases/listarTokensDoUsuario";
import { criarTokenTeste, criarTokensSimulacroRepositorio } from "./simulacros/tokensSimulacroRepositorio";
import { criarPoliticaSegurancaTokensFake } from "./fake/politicaSegurancaTokensFake";

describe("#1 - createFnListarTokensDoUsuario", () => {
  it("#1.1 - deve listar tokens do usuário ordenados por emissão decrescente", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-antigo",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        emitidoEm: new Date("2026-01-01T00:00:00.000Z"),
      }),
      criarTokenTeste({
        tokenId: "tok-novo",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        emitidoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
      criarTokenTeste({
        tokenId: "tok-outro",
        usuarioId: "usr-2",
        locatarioId: "loc-1",
      }),
    ]);

    const usecase = createFnListarTokensDoUsuario({ tokensRepo: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((item) => item.tokenId)).toEqual([
        "tok-novo",
        "tok-antigo",
      ]);
    }
  });

  it("#1.2 - deve retornar lista vazia", async () => {
    const repo = criarTokensSimulacroRepositorio();
    const usecase = createFnListarTokensDoUsuario({ tokensRepo: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens).toEqual([]);
  });

  it("#1.3 - deve propagar falha do repositório", async () => {
    const repo = criarTokensSimulacroRepositorio();
    repo.simularFalha("listarPorUsuario");

    const usecase = createFnListarTokensDoUsuario({ tokensRepo: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de listar tokens", async () => {
    const repo = criarTokensSimulacroRepositorio();
    const politica = criarPoliticaSegurancaTokensFake();

    const usecase = createFnListarTokensDoUsuario({
      tokensRepo: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "TOKEN_LISTAR",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar listagem", async () => {
    const repo = criarTokensSimulacroRepositorio();
    const politica = criarPoliticaSegurancaTokensFake({ autorizado: false });

    const usecase = createFnListarTokensDoUsuario({
      tokensRepo: repo,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
