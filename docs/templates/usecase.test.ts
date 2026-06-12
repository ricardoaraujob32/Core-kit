// templates/usecase.test.ts

import { describe, it, expect } from "vitest";
import { executar } from "./usecase"; // ajuste o path real
import { InMemoryEntityRepo } from "./repository.inmemory";

// Helpers mínimos (adapte ao seu Core Kit)
function ctxBase(overrides: Partial<any> = {}) {
  return {
    locatarioId: "loc_1",
    usuarioId: "usr_1",
    papeis: ["gerente"],
    permissoes: ["clientes.criar"],
    agora: () => new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("Usecase: executar", () => {
  it("deve executar com sucesso", async () => {
    const repo = new InMemoryEntityRepo();

    const ctx = ctxBase();
    const input = {
      // preencher
    };

    const res = await executar(ctx, input, {
      // deps
      // repo
    } as any);

    expect(res.isOk).toBe(true);
  });

  it("deve falhar sem permissao", async () => {
    const repo = new InMemoryEntityRepo();

    const ctx = ctxBase({ permissoes: [] });
    const input = {};

    const res = await executar(ctx, input as any, { } as any);

    expect(res.isErr).toBe(true);
    if (res.isErr) {
      expect(res.error.code).toBe("SEM_PERMISSAO");
    }
  });

  it("deve isolar multi-tenant", async () => {
    const repo = new InMemoryEntityRepo();

    // salva em loc_1
    await repo.save("loc_1", { id: "e1" });

    // consulta em loc_2 não deve ver
    const other = await repo.findById("loc_2", "e1");
    expect(other).toBeNull();
  });
});