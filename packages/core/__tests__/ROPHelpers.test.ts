// packages/core/__tests__/ROPHelpers.test.ts

import { describe, it, expect } from "vitest";
import { isErroApp, mapCodigoErroToMensagemErro, type CodigoErroApp,} from "../src/erros";
import { createErroApp, normalizarMensagem } from "../src/ROPHelpers"

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

describe("", () => {
  it("", () => {

  });
});
