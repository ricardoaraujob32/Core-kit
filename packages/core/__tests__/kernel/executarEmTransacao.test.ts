// packages/core/__tests__/kernel/executarEmTransacao.test.ts

import { describe, expect, it } from "vitest";
import { TransacaoPorta, executarEmTransacao, createErroApp, wrapOk } from "../../src/kernel";

describe("#1 - executarEmTransacao", () => {
  it("#1.1 - deve executar diretamente quando não há transação", async () => {
    const resultado = await executarEmTransacao(undefined, async () => wrapOk(123));

    expect(resultado).toEqual(wrapOk(123));
  });

  it("#1.2 - deve delegar para transacao.executar quando houver transação", async () => {
    let chamada = false;

    const transacao: TransacaoPorta = {
      async executar(fn) {
        chamada = true;
        return fn();
      },
    };

    const resultado = await executarEmTransacao(transacao, async () => wrapOk(456));

    expect(chamada).toBe(true);
    expect(resultado).toEqual(wrapOk(456));
  });

  it("#1.3 - deve preservar Err retornado pela operação", async () => {
    const erro = createErroApp({
      codigo: "ERRO_INTERNO",
      mensagem: "Falha simulada.",
      detalhes: { simulada: true },
    });

    const resultado = await executarEmTransacao(undefined, async () => erro);

    expect(resultado).toBe(erro);
  });
});