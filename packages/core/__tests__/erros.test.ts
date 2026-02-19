// packages/core/__tests__/erros.test.ts

import { describe, it, expect } from "vitest";
import { erroApp, isErroApp, mapCodigoErroToMensagemErro } from "../src/erros";

describe("#1 - construtor de ErroApp e serialização", () => {
  it("#1.1 - recebe código e mensagem e serializa", () => {
    const e = erroApp("NAO_AUTENTICADO", "Usuário não autenticado.");

    expect(e).toEqual({
      codigo: "NAO_AUTENTICADO",
      mensagem: "Usuário não autenticado.",
      detalhes: undefined,
      causa: undefined,
    });

    // garante serialização previsível
    expect(JSON.parse(JSON.stringify(e))).toEqual({
      codigo: "NAO_AUTENTICADO",
      mensagem: "Usuário não autenticado.",
    });
  });

  it("#1.2 - inclui detalhes e serializa", () => {
    const e = erroApp("NAO_AUTORIZADO", "Permissões insuficientes.", {permissaoExigida: "ADMIN",});

    expect(e).toEqual({
      codigo: "NAO_AUTORIZADO",
      mensagem: "Permissões insuficientes.",
      detalhes: { permissaoExigida: "ADMIN" },
      causa: undefined,
    });

    // serializável com detalhes
    expect(JSON.parse(JSON.stringify(e))).toEqual({
      codigo: "NAO_AUTORIZADO",
      mensagem: "Permissões insuficientes.",
      detalhes: { permissaoExigida: "ADMIN" },
    });
  });

  it("#1.3 - inclui causa", () => {
    const excecao = new Error("Exceção lançada");
    const e = erroApp("NAO_AUTORIZADO", "Permissões insuficientes.", {permissaoExigida: "ADMIN",}, excecao);

    expect(e).toEqual({
      codigo: "NAO_AUTORIZADO",
      mensagem: "Permissões insuficientes.",
      detalhes: { permissaoExigida: "ADMIN" },
      causa: (excecao),
    });    
  });

  it("#1.4 - isErroApp valida estrutura mínima", () => {
    expect(isErroApp({ codigo: "INVALIDO", mensagem: "x" })).toBe(true);
    expect(isErroApp({ codigo: "INVALIDO" })).toBe(false);
    expect(isErroApp({})).toBe(false);
    expect(isErroApp(null)).toBe(false);
  });  
});

describe("#2 - Mapeamento de códigos para mensagens", () =>{
  it("#2.1 - deve fornecer mensagem padrão para cada código", () => {
    expect(mapCodigoErroToMensagemErro("NAO_AUTORIZADO")).toBe("Permissões insuficientes.");
    expect(mapCodigoErroToMensagemErro("NAO_AUTENTICADO")).toBe("Usuário não autenticado.");
    expect(mapCodigoErroToMensagemErro("INVALIDO")).toBe("Requisição inválida.");
    expect(mapCodigoErroToMensagemErro("NAO_ENCONTRADO")).toBe("Recurso não encontrado.");
    expect(mapCodigoErroToMensagemErro("ERRO_INTERNO")).toBe("Erro interno.");
    expect(mapCodigoErroToMensagemErro("CONFLITO")).toBe("Conflito de dados.");
  });
});
