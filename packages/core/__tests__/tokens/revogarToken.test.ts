// packages/core/__tests__/tokens/revogarToken.test.ts

import { describe, expect, it } from "vitest";
import { createFnRevogarToken } from "../../src/tokens/usecases/revogarToken";
import { criarTokenTeste, criarTokensSimulacroRepositorio } from "./simulacros/tokensSimulacroRepositorio";
import { DATA_FUTURA, DATA_TESTE, relogioTeste } from "./helpers/tokensUsecaseTestUtils";
import { criarPoliticaSegurancaTokensFake } from "./fake/politicaSegurancaTokensFake";

describe("#1 - createFnRevogarToken", () => {
  it("#1.1 - deve revogar token ativo", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-1",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        expiraEm: DATA_FUTURA,
      }),
    ]);

    const usecase = createFnRevogarToken({
      tokensRepo: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-1",
      agora: DATA_TESTE,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.token.revogadoEm).toEqual(DATA_TESTE);
  });

  it("#1.2 - deve falhar quando token não existe", async () => {
    const repo = criarTokensSimulacroRepositorio();

    const usecase = createFnRevogarToken({
      tokensRepo: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-x",
      agora: DATA_TESTE,
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando token já está revogado", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-1",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        revogadoEm: DATA_TESTE,
      }),
    ]);

    const usecase = createFnRevogarToken({
      tokensRepo: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-1",
      agora: DATA_TESTE,
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao buscar token", async () => {
    const repo = criarTokensSimulacroRepositorio();
    repo.simularFalha("buscarPorId");

    const usecase = createFnRevogarToken({
      tokensRepo: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-1",
      agora: DATA_TESTE,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});

describe("#2 - política de segurança", () => {
  it("#2.1 - deve autorizar operação antes de revogar token", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-1",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        expiraEm: DATA_FUTURA,
      }),
    ]);
    const politica = criarPoliticaSegurancaTokensFake();

    const usecase = createFnRevogarToken({
      tokensRepo: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-1",
      agora: DATA_TESTE,
    });

    expect(resultado.ok).toBe(true);
    expect(politica.ultimaChamada()).toMatchObject({
      operacao: "TOKEN_REVOGAR",
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-1",
    });
  });

  it("#2.2 - deve retornar erro quando política negar revogação", async () => {
    const repo = criarTokensSimulacroRepositorio([
      criarTokenTeste({
        tokenId: "tok-1",
        usuarioId: "usr-1",
        locatarioId: "loc-1",
        expiraEm: DATA_FUTURA,
      }),
    ]);
    const politica = criarPoliticaSegurancaTokensFake({ autorizado: false });

    const usecase = createFnRevogarToken({
      tokensRepo: repo,
      relogio: relogioTeste,
      politicaSeguranca: politica.politicaSeguranca,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      tokenId: "tok-1",
      agora: DATA_TESTE,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
