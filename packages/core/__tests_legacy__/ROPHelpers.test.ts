// packages/core/__tests__/kernel/ROPHelpers.test.ts

import { describe, expect, it } from "vitest";
import { createErroApp, fromThrowable, fromThrowableAsync, normalizarMensagem } from "../src/kernel";

describe("#1 - createErroApp", () => {
  it("#1.1 - deve criar Err com ErroApp", () => {
    const resultado = createErroApp({
      codigo: "INVALIDO",
      mensagem: "Entrada inválida.",
      detalhes: { campo: "nome" },
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("INVALIDO");
      expect(resultado.error.detalhes).toEqual({ campo: "nome" });
    }
  });

  it("#1.2 - deve normalizar mensagem", () => {
    expect(normalizarMensagem("  teste  ")).toBe("teste");
    expect(normalizarMensagem("   ")).toBe("");
    expect(normalizarMensagem(null)).toBe("");
    expect(normalizarMensagem(undefined)).toBe("");
  });
});

describe("#2 - fromThrowable", () => {
  it("#2.1 - deve retornar Ok quando não lança exceção", () => {
    const resultado = fromThrowable(() => 123);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value).toBe(123);
  });

  it("#2.2 - deve converter exceção comum em ERRO_INTERNO", () => {
    const causa = new Error("boom");

    const resultado = fromThrowable(() => {
      throw causa;
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("ERRO_INTERNO");
      expect(resultado.error.causa).toBe(causa);
    }
  });

  it("#2.3 - deve preservar ErroApp lançado", () => {
    const erro = createErroApp({
      codigo: "CONFLITO",
      mensagem: "Conflito.",
    });

    if (erro.ok) throw new Error("setup inválido");

    const resultado = fromThrowable(() => {
      throw erro.error;
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error).toBe(erro.error);
  });

  it("#2.4 - deve preservar Result Err lançado", () => {
    const erro = createErroApp({
      codigo: "INVALIDO",
      mensagem: "Inválido.",
    });

    const resultado = fromThrowable(() => {
      throw erro;
    });

    expect(resultado).toBe(erro);
  });
});

describe("#3 - fromThrowableAsync", () => {
  it("#3.1 - deve retornar Ok quando não lança exceção", async () => {
    const resultado = await fromThrowableAsync(async () => 456);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value).toBe(456);
  });

  it("#3.2 - deve converter exceção comum em ERRO_INTERNO", async () => {
    const causa = new Error("boom");

    const resultado = await fromThrowableAsync(async () => {
      throw causa;
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("ERRO_INTERNO");
      expect(resultado.error.causa).toBe(causa);
    }
  });

  it("#3.3 - deve preservar ErroApp lançado", async () => {
    const erro = createErroApp({
      codigo: "CONFLITO",
      mensagem: "Conflito.",
    });

    if (erro.ok) throw new Error("setup inválido");

    const resultado = await fromThrowableAsync(async () => {
      throw erro.error;
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error).toBe(erro.error);
  });

  it("#3.4 - deve preservar Result Err lançado", async () => {
    const erro = createErroApp({
      codigo: "INVALIDO",
      mensagem: "Inválido.",
    });

    const resultado = await fromThrowableAsync(async () => {
      throw erro;
    });

    expect(resultado).toBe(erro);
  });
});
