// packages/core/__tests__/kernel/maquinaEstados.test.ts

import { describe, expect, it } from "vitest";
import { createErroApp, transicionarEstado } from "../../src/kernel";

describe("#1 - maquinaEstados", () => {
  it("#1.1 - deve transicionar estado válido", () => {
    const tabela = {
      ABERTO: {
        FECHAR: "FECHADO",
      },
      FECHADO: {},
    } as const;

    const resultado = transicionarEstado({
      tabela,
      estadoAtual: "ABERTO",
      evento: "FECHAR",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value).toBe("FECHADO");
  });

  it("#1.2 - deve retornar erro em transição inválida", () => {
    const tabela = {
      ABERTO: {},
      FECHADO: {
        REABRIR: "ABERTO",
      },
    } as const;

    const resultado = transicionarEstado({
      tabela,
      estadoAtual: "ABERTO",
      evento: "REABRIR",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve usar callback de erro customizado", () => {
    const tabela = {
      ABERTO: {},
      FECHADO: {
        REABRIR: "ABERTO",
      },
    } as const;

    const resultado = transicionarEstado({
      tabela,
      estadoAtual: "ABERTO",
      evento: "REABRIR",
      onTransicaoInvalida: () =>
        createErroApp({
          codigo: "INVALIDO",
          mensagem: "Transição inválida.",
          detalhes: { custom: true },
        }),
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.custom).toBe(true);
  });
});