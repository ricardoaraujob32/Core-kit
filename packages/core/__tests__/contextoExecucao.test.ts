import { describe, it, expect } from "vitest";
import { createContextoExecucao, isContextoExecucao } from "../src/contextoExecucao";

describe("#1 - ContextoExecucao", () => {
  it("#1.1 - deve criar contexto válido mínimo", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
    });

    expect(ctx.locatarioId).toBe("loc-1");
    expect(ctx.usuarioId).toBeUndefined();
  });

  it("#1.2 - deve rejeitar locatarioId vazio", () => {
    expect(() =>
      createContextoExecucao({ locatarioId: "" }),
    ).toThrow();
  });

  it("#1.3 - deve aceitar usuarioId string válida", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: "user-1",
    });

    expect(ctx.usuarioId).toBe("user-1");
  });

  it("#1.4 - deve rejeitar usuarioId string vazia", () => {
    expect(() =>
      createContextoExecucao({
        locatarioId: "loc-1",
        usuarioId: "",
      }),
    ).toThrow();
  });

  it("#1.5 - não deve aceitar usuarioId string vazia", () => {
    expect(() =>
      createContextoExecucao({ locatarioId: "L1", usuarioId: "" })
    ).toThrow();
    expect(() =>
      createContextoExecucao({ locatarioId: "L1", usuarioId: "   " })
    ).toThrow();
  });

  it("#1.6 - não deve aceitar usuarioId null", () => {
    expect(() =>
      createContextoExecucao({ locatarioId: "L1", usuarioId: null as any })
    ).toThrow("usuarioId não pode ser null");
  });

  it("#1.7 - deve aceitar usuarioId undefined (não autenticado)", () => {
    const ctx = createContextoExecucao({ locatarioId: "L1" });
    expect(ctx.locatarioId).toBe("L1");
    expect(ctx.usuarioId).toBe(undefined);
  });

  it("#1.8 - deve congelar permissões e papéis", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      permissoes: ["LOCATARIO_ESCREVER"],
      papeis: ["B"],
    });

    expect(Object.isFrozen(ctx.permissoes)).toBe(true);
    expect(Object.isFrozen(ctx.papeis)).toBe(true);
  });

  it("#1.9 - deve ser imutável", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
    });

    expect(() => {
      (ctx as any).locatarioId = "hack";
    }).toThrow();
  });

  it("#1.10 - type guard deve reconhecer contexto válido", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
    });

    expect(isContextoExecucao(ctx)).toBe(true);
  });

  it("#1.11 - type guard deve rejeitar objeto comum", () => {
    expect(isContextoExecucao({})).toBe(false);
  });
});
