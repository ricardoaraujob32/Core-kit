// packages/core/__tests__/tokens/rotacionarToken.test.ts

import { describe, expect, it } from "vitest";
import { createFnRotacionarToken } from "../../src/tokens/usecases/rotacionarToken";
import { criarTokenTeste, criarTokensSimulacroRepositorio } from "./simulacros/tokensSimulacroRepositorio";
import { criarIdPortaSequencial, DATA_FUTURA, DATA_PASSADA, DATA_TESTE, relogioTeste } from "./helpers/tokensUsecaseTestUtils";
import { criarPoliticaSegurancaTokensFake } from "./fake/politicaSegurancaTokensFake";

describe("#1 - createFnRotacionarToken", () => {
  it("#1.1 - deve revogar token anterior e criar novo token encadeado", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-antigo",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-antigo-valido-1234567890",
        expiraEm: DATA_FUTURA,
      }),
    ]);

    const usecase = createFnRotacionarToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-novo"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-antigo",
      novoHashToken: "hash-token-novo-valido-1234567890",
      novoExpiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.tokenAnterior.revogadoEm).toEqual(DATA_TESTE);
      expect(resultado.value.tokenAnterior.proximoTokenId).toBe("tok-novo");
      expect(resultado.value.tokenNovo.tokenId).toBe("tok-novo");
    }
  });

  it("#1.2 - deve falhar quando token não existe", async () => {
    const repo = criarTokensSimulacroRepositorio();

    const usecase = createFnRotacionarToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-novo"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-x",
      novoHashToken: "hash-token-novo-valido-1234567890",
      novoExpiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando token já está revogado", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-antigo",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        revogadoEm: DATA_TESTE,
      }),
    ]);

    const usecase = createFnRotacionarToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-novo"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-antigo",
      novoHashToken: "hash-token-novo-valido-1234567890",
      novoExpiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando novo hash já existe", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-antigo",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-antigo-valido-1234567890",
        expiraEm: DATA_FUTURA,
      }),
      criarTokenTeste({
        tokenId: "tok-existente",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-novo-valido-1234567890",
        expiraEm: DATA_FUTURA,
      }),
    ]);

    const usecase = createFnRotacionarToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-novo"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-antigo",
      novoHashToken: "hash-token-novo-valido-1234567890",
      novoExpiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve falhar quando nova expiração não é futura", async () => {
    const repo = criarTokensSimulacroRepositorio();

    const usecase = createFnRotacionarToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-novo"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-antigo",
      novoHashToken: "hash-token-novo-valido-1234567890",
      novoExpiraEm: DATA_PASSADA,
    });

    expect(resultado.ok).toBe(false);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de rotacionar token", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-antigo",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-antigo-valido-1234567890",
        expiraEm: DATA_FUTURA,
      }),
    ]);
    const politica = criarPoliticaSegurancaTokensFake();

    const usecase = createFnRotacionarToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-novo"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-antigo",
      novoHashToken: "hash-token-novo-valido-1234567890",
      novoExpiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "TOKEN_ROTACIONAR",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-antigo",
    });
  });

  it("#2.2 - deve retornar erro quando política negar rotação", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-antigo",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        hashToken: "hash-token-antigo-valido-1234567890",
        expiraEm: DATA_FUTURA,
      }),
    ]);
    const politica = criarPoliticaSegurancaTokensFake({ autorizado: false });

    const usecase = createFnRotacionarToken({
      tokensRepo: repo,
      idPorta: criarIdPortaSequencial(["tok-novo"]),
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-antigo",
      novoHashToken: "hash-token-novo-valido-1234567890",
      novoExpiraEm: DATA_FUTURA,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
