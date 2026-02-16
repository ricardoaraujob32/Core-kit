import { describe, it, expect } from "vitest";
import { erroApp, isErroApp } from "../src/erros";

describe("erros", () => {
  it("usa mensagem padrão quando não há mensagem personalizada e serializa", () => {
    const e = erroApp("NAO_AUTENTICADO", "");

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

  it("usa e normaliza mensagem personalizada quando fornecida", () => {
    const e1 = erroApp("ERRO_INTERNO", "Mensagem personalizada");

    expect(e1).toEqual({
      codigo: "ERRO_INTERNO",
      mensagem: "Mensagem personalizada",
      detalhes: undefined,
      causa: undefined,
    });

    const e2 = erroApp("ERRO_INTERNO", "  Mensagem      personalizada     ");

    expect(e2).toEqual({
      codigo: "ERRO_INTERNO",
      mensagem: "Mensagem personalizada",
      detalhes: undefined,
      causa: undefined,
    });
  });

  it("usa mensagem padrão quando null, undefined ou vazia", () => {
    const e1 = erroApp("ERRO_INTERNO", "");

    expect(e1).toEqual({
      codigo: "INVALIDO",
      mensagem: "Dados inválidos.",
      detalhes: undefined,
      causa: undefined,
    });
  });

  it("appError() inclui details quando fornecido", () => {
    const e = erroApp("NAO_AUTORIZADO", "", {permissaoExigida: "ADMIN",});

    expect(e).toEqual({
      codigo: "NAO_AUTORIZADO",
      mensagem: "Permissões insuficientes.",
      detalhes: { permissaoExigida: "ADMIN" },
      causa: undefined,
    });

    // serializável com details
    expect(JSON.parse(JSON.stringify(e))).toEqual({
      codigo: "NAO_AUTORIZADO",
      mensagem: "Permissões insuficientes.",
      detalhes: { permissaoExigida: "ADMIN" },
    });
  });

  it("appError() inclui details quando fornecido", () => {
    const e = erroApp("NAO_AUTORIZADO", "", {permissaoExigida: "ADMIN",}, "Exceção lançada");

    expect(e).toEqual({
      codigo: "NAO_AUTORIZADO",
      mensagem: "Permissões insuficientes.",
      detalhes: { permissaoExigida: "ADMIN" },
      causa: "Exceção lançada",
    });    
  });

  it("isErroApp valida estrutura mínima", () => {
    expect(isErroApp({ codigo: "INVALIDO", mensagem: "x" })).toBe(true);
    expect(isErroApp({ codigo: "INVALIDO" })).toBe(false);
    expect(isErroApp(null)).toBe(false);
  });  
});
