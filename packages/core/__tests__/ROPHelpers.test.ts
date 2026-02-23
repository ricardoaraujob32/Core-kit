// packages/core/__tests__/ROPHelpers.test.ts

import { describe, it, expect } from "vitest";
import { erroApp, isErroApp, mapCodigoErroToMensagemErro, type CodigoErroApp,} from "../src/erros";
import { createErroApp, normalizarMensagem, fromThrowable, fromThrowableAsync } from "../src/ROPHelpers"

describe("#1 - fábrica de erros e normalização de mensagens", () => {
  it("#1.1 - deve usar mensagem padrão quando não for passada mensagem customizada", () => {
    const codigo: CodigoErroApp = "NAO_AUTORIZADO";

    const e = createErroApp( {codigo:codigo} );

    expect(e).toStrictEqual( {"ok": false, "error":{codigo: "NAO_AUTORIZADO", mensagem: "Permissões insuficientes.", detalhes: undefined, causa: undefined,}});
  });

  it("#1.2 - deve aceitar mensagem customizada e NÃO sobrescrever com a padrão", () => {
    const codigo: CodigoErroApp = "NAO_AUTORIZADO";
    const mensagem = "Você não pode acessar este recurso.";

    const e = createErroApp( {codigo:codigo, mensagem:mensagem} );

    expect(e).toStrictEqual( {"ok": false, "error":{codigo: "NAO_AUTORIZADO", mensagem: "Você não pode acessar este recurso.", detalhes: undefined, causa: undefined,}});
  });

  it("#1.3 - deve manter detalhes e causa quando fornecidos", () => {
    const codigo: CodigoErroApp = "NAO_AUTORIZADO";
    const detalhes = { campo: "nome", motivo: "vazio" };
    const causa = new Error("root cause");

    const e = createErroApp( {codigo, mensagem:"", detalhes, causa} );

    expect(e).toStrictEqual( {"ok": false, "error":{codigo: "NAO_AUTORIZADO", mensagem: "Permissões insuficientes.", detalhes: detalhes, causa: causa,}});
  });

  it("#1.4 - normalizarMensagem retorna a mensagem sem espaços extras no começo e fim", () => {
    const original = "     nome inválido     ";
    const m = normalizarMensagem(original);

    expect(m).toStrictEqual("nome inválido");
  });

  it("#1.5 - normalizarMensagem retorna vazio se a original for vazio, null ou undefined", () => {
    const o1 = "";
    const m1 = normalizarMensagem(o1);
    
    const o2 = "       ";
    const m2 = normalizarMensagem(o2);

    const o3 = null;
    const m3 = normalizarMensagem(o3);

    const o4 = undefined;
    const m4 = normalizarMensagem(o4);

    expect(m1).toBe("");
    expect(m2).toBe("");
    expect(m3).toBe("");
    expect(m4).toBe("");
  });
});

describe("#2 - fromThrowable / fromThrowableAsync", () => {
  it("#2.1 - fromThrowable deve retornar Ok quando não há exceção", () => {
    const r = fromThrowable(() => 123);

    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(123);
  });

  it("#2.2 - fromThrowable deve transformar exceção comum em ErroApp ERRO_INTERNO", () => {
    const causa = new Error("boom");
    const r = fromThrowable(() => {
      throw causa;
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
      expect(r.error.mensagem).toBe("Erro interno.");
      expect(r.error.causa).toBe(causa);
    }
  });

  it("#2.3 - fromThrowable deve preservar ErroApp lançado", () => {
    const e = erroApp("CONFLITO", "Conflito de dados.");
    const r = fromThrowable(() => {
      throw e;
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });

  it("#2.4 - fromThrowable deve preservar Result Err lançado", () => {
    const errResult = createErroApp({ codigo: "INVALIDO", mensagem: "Campo obrigatório.", detalhes: { campo: "nome" } });

    const r = fromThrowable(() => {
      throw errResult;
    });

    expect(r).toStrictEqual(errResult);
  });

  it("#2.5 - fromThrowableAsync deve retornar Ok quando não há exceção", async () => {
    const r = await fromThrowableAsync(async () => 456);

    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(456);
  });

  it("#2.6 - fromThrowableAsync deve transformar exceção comum em ErroApp ERRO_INTERNO", async () => {
    const causa = new Error("boom-async");
    const r = await fromThrowableAsync(async () => {
      throw causa;
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
      expect(r.error.mensagem).toBe("Erro interno.");
      expect(r.error.causa).toBe(causa);
    }
  });

  it("#2.7 - fromThrowableAsync deve preservar ErroApp lançado", async () => {
    const e = erroApp("CONFLITO", "Conflito de dados.");
    const r = await fromThrowableAsync(async () => {
      throw e;
    });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });

  it("#2.8 - fromThrowableAsync deve preservar Result Err lançado", async () => {
    const errResult = createErroApp({ codigo: "INVALIDO", mensagem: "Campo obrigatório.", detalhes: { campo: "nome" } });

    const r = await fromThrowableAsync(async () => {
      throw errResult;
    });

    expect(r).toStrictEqual(errResult);
  });
});
