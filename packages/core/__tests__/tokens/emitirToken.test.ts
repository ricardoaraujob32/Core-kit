// packages/core/__tests__/tokens/emitirToken.test.ts

import { describe, expect, it } from "vitest";
import { createFnEmitirToken } from "../../src/tokens/usecases/emitirToken";
import { criarTokenTeste, criarTokensSimulacroRepositorio } from "./simulacros/tokensSimulacroRepositorio";
import { criarIdPortaSequencial, DATA_FUTURA, DATA_PASSADA, relogioTeste } from "./helpers/tokensUsecaseTestUtils";
import { criarPoliticaSegurancaTokensFake } from "./fake/politicaSegurancaTokensFake";

describe("#1 - createFnEmitirToken", () => {
  it("#1.1 - deve emitir token válido", async () => {
    const repo = criarTokensSimulacroRepositorio();

    const usecase = createFnEmitirToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      usuarioId: "usr-1",
      locatarioId: "loc-1",
      hashToken: "hash-token-valido-1234567890",
      tipo: "ACESSO",
      expiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.tokenId).toBe("tok-1");
    expect(repo.dump()).toHaveLength(1);
  });

  it("#1.2 - deve falhar quando expiração não é futura", async () => {
    const repo = criarTokensSimulacroRepositorio();

    const usecase = createFnEmitirToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      usuarioId: "usr-1",
      locatarioId: "loc-1",
      hashToken: "hash-token-novo-valido-1234567890",
      tipo: "ACESSO",
      expiraEm: DATA_PASSADA,
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando hash já existe", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-existente",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-novo-valido-1234567890",
      }),
    ]);

    const usecase = createFnEmitirToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      usuarioId: "usr-1",
      locatarioId: "loc-1",
      hashToken: "hash-token-novo-valido-1234567890",
      tipo: "ACESSO",
      expiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao buscar hash", async () => {
    const repo = criarTokensSimulacroRepositorio();
    repo.simularFalha("buscarPorHash");

    const usecase = createFnEmitirToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      usuarioId: "usr-1",
      locatarioId: "loc-1",
      hashToken: "hash-token-valido-1234567890",
      tipo: "ACESSO",
      expiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de emitir token", async () => {
    const repo = criarTokensSimulacroRepositorio();
    const politica = criarPoliticaSegurancaTokensFake();

    const usecase = createFnEmitirToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-1"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      usuarioId: "usr-1",
      locatarioId: "loc-1",
      hashToken: "hash-token-valido-1234567890",
      tipo: "ACESSO",
      expiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "TOKEN_EMITIR",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar emissão", async () => {
    const repo = criarTokensSimulacroRepositorio();
    const politica = criarPoliticaSegurancaTokensFake({ autorizado: false });

    const usecase = createFnEmitirToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-1"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      usuarioId: "usr-1",
      locatarioId: "loc-1",
      hashToken: "hash-token-valido-1234567890",
      tipo: "ACESSO",
      expiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
