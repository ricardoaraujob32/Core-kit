import { describe, it, expect } from "vitest";

// Ajuste conforme seu index.ts
import { criarUsuario, listarUsuarios, ok, err } from "../src/index";

describe("Usuários - casos de uso", () => {
  it("criarUsuario deve falhar com dados inválidos", async () => {
    const repo = {
      create: async () => ok({} as any),
      findByNome: async () => ok(null),
    } as any;

    const ctx = { locatarioId: "loc-1", usuarioId: "usr-1", permissoes: ["USUARIOS_ESCRITA"] } as any;

    const r = await criarUsuario(ctx, repo, { nome: "" } as any);
    expect(r.ok).toBe(false);
  });

  it("listarUsuarios deve retornar lista (mesmo vazia)", async () => {
    const repo = {
      list: async () => ok([]),
    } as any;

    const ctx = { locatarioId: "loc-1", usuarioId: "usr-1", permissoes: ["USUARIOS_LEITURA"] } as any;

    const r = await listarUsuarios(ctx, repo);
    expect(r.ok).toBe(true);
    expect(Array.isArray(r.value)).toBe(true);
  });
});
