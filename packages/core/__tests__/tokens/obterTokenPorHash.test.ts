// packages/core/__tests__/tokens/obterTokenPorHash.test.ts

import { describe, expect, it } from "vitest";
import { createFnObterTokenPorHash } from "../../src/tokens/usecases/obterTokenPorHash";
import { criarTokenTeste, criarTokensSimulacroRepositorio } from "./simulacros/tokensSimulacroRepositorio";
import { DATA_FUTURA, DATA_PASSADA, DATA_TESTE, relogioTeste } from "./helpers/tokensUsecaseTestUtils";
import { criarPoliticaSegurancaTokensFake } from "./fake/politicaSegurancaTokensFake";

describe("#1 - createFnObterTokenPorHash", () => {
  it("#1.1 - deve obter token válido por hash", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-1",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-valido-1234567890",
        expiraEm: DATA_FUTURA,
      }),
    ]);

    const usecase = createFnObterTokenPorHash({
      tokensRepo: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      hashToken: "hash-token-valido-1234567890",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.token.tokenId).toBe("tok-1");
  });

  it("#1.2 - deve falhar quando token não existe", async () => {
    const repo = criarTokensSimulacroRepositorio();

    const usecase = createFnObterTokenPorHash({
      tokensRepo: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      hashToken: "hash-token-existente-valido-1234567890",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando token está revogado", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-1",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-existente-valido-1234567890",
        revogadoEm: DATA_TESTE,
      }),
    ]);

    const usecase = createFnObterTokenPorHash({
      tokensRepo: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      hashToken: "hash-token-existente-valido-1234567890",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando token está expirado", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-1",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-existente-valido-1234567890",
        expiraEm: DATA_PASSADA,
      }),
    ]);

    const usecase = createFnObterTokenPorHash({
      tokensRepo: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      hashToken: "hash-token-existente-valido-1234567890",
    });

    expect(resultado.ok).toBe(false);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de obter token por hash", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-1",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-valido-1234567890",
        expiraEm: DATA_FUTURA,
      }),
    ]);
    const politica = criarPoliticaSegurancaTokensFake();

    const usecase = createFnObterTokenPorHash({
      tokensRepo: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      hashToken: "hash-token-valido-1234567890",
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "TOKEN_OBTER_POR_HASH",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar obtenção por hash", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-1",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-valido-1234567890",
        expiraEm: DATA_FUTURA,
      }),
    ]);
    const politica = criarPoliticaSegurancaTokensFake({ autorizado: false });

    const usecase = createFnObterTokenPorHash({
      tokensRepo: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      hashToken: "hash-token-valido-1234567890",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
