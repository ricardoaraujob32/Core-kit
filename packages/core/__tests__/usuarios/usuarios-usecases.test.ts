import { describe, it, expect } from "vitest";

// Ajuste conforme seu index.ts
import { criarUsuario, listarUsuarios, wrapOk, wrapErr } from "../../src/index";

describe("Usuários - casos de uso", () => {
  it("criarUsuario deve falhar com dados inválidos", async () => {
    const repo = {
      create: async () => wrapOk({} as any),
      findByNome: async () => wrapOk(null),
    } as any;

    const ctx = { locatarioId: "loc-1", usuarioId: "usr-1", permissoes: ["USUARIOS_ESCRITA"] } as any;

    const r = await criarUsuario(ctx, repo, { nome: "" } as any);
    expect(r.ok).toBe(false);
  });

  it("listarUsuarios deve retornar lista (mesmo vazia)", async () => {
    const repo = {
      list: async () => wrapOk([]),
    } as any;

    const ctx = { locatarioId: "loc-1", usuarioId: "usr-1", permissoes: ["USUARIOS_LEITURA"] } as any;

    const r = await listarUsuarios(ctx, repo);
    expect(r.ok).toBe(true);
    expect(Array.isArray(r.value)).toBe(true);
  });
});
