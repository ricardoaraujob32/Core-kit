// packages/core/__tests__/kernel/contextoExecucao.test.ts

import { describe, expect, it } from "vitest";
import { createContextoExecucao, isContextoExecucao } from "../src/kernel";

describe("#1 - createContextoExecucao", () => {
  it("#1.1 - deve criar contexto mínimo válido", () => {
    const ctx = createContextoExecucao({
      usuarioId: "usr-1",
      locatarioId: "loc-1",
    })

    expect(ctx.locatarioId).toBe("loc-1");
    expect(ctx.usuarioId).toBeUndefined();
    expect(isContextoExecucao(ctx)).toBe(true);
  });

  it("#1.2 - deve criar contexto autenticado", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    expect(ctx.usuarioId).toBe("usr-1");
    expect(isContextoExecucao(ctx)).toBe(true);
  });

  it("#1.3 - deve rejeitar locatarioId inválido", () => {
    expect(() =>
      createContextoExecucao({
        usuarioId: "usr-1",
        locatarioId: "",
      }),
    ).toThrow();

    expect(() =>
      createContextoExecucao({
        usuarioId: "usr-1",
        locatarioId: "   ",
      }),
    ).toThrow();
  });

  it("#1.4 - deve rejeitar usuarioId inválido", () => {
    expect(() => createContextoExecucao({ locatarioId: "loc-1", usuarioId: "" })).toThrow();
    expect(() => createContextoExecucao({ locatarioId: "loc-1", usuarioId: "   " })).toThrow();
    expect(() => createContextoExecucao({ locatarioId: "loc-1", usuarioId: null as never })).toThrow();
  });

  it("#1.5 - deve congelar contexto e arrays internos", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      papeis: ["ADMIN"] as never,
      permissoes: ["USUARIO_LISTAR"] as never,
      modulosHabilitados: ["vendas"] as never,
    });

    expect(Object.isFrozen(ctx)).toBe(true);
    expect(Object.isFrozen(ctx.papeis)).toBe(true);
    expect(Object.isFrozen(ctx.permissoes)).toBe(true);
    expect(Object.isFrozen(ctx.modulosHabilitados)).toBe(true);
    expect(ctx.modulosHabilitados).toEqual(["VENDAS"]);
  });

  it("#1.6 - deve fazer cópia defensiva dos arrays", () => {
    const papeis = ["ADMIN"] as never[];
    const permissoes = ["USUARIO_LISTAR"] as never[];

    const ctx = createContextoExecucao({
      usuarioId: "usr-1",
      locatarioId: "loc-1",
      papeis,
      permissoes,
    });

    papeis.push("HACK" as never);
    permissoes.push("HACK" as never);

    expect(ctx.papeis).toEqual(["ADMIN"]);
    expect(ctx.permissoes).toEqual(["USUARIO_LISTAR"]);
  });

  it("#1.7 - isContextoExecucao deve rejeitar objeto comum", () => {
    expect(isContextoExecucao({ locatarioId: "loc-1" })).toBe(false);
    expect(isContextoExecucao(null)).toBe(false);
  });
});