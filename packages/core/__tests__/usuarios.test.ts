// packages/core/__tests__/usuarios.test.ts
import { describe, it, expect } from "vitest";

import { createUsuariosMemoryRepo } from "../src/usuarios/memoryRepo";
import { criarUsuario } from "../src/usuarios/usecases/criarUsuario";
import { listarUsuarios } from "../src/usuarios/usecases/listarUsuarios";

import type { ContextoExecucao } from "../src/locatario"; // ajuste se necessário
import { Usuario } from "../src/usuarios/types";

function ctxBase(overrides?: Partial<ContextoExecucao>): ContextoExecucao {
  return {
    locatarioId: "loc-1",
    usuarioId: "user-1",
    permissoes: [],
    ...(overrides ?? {}),
  } as ContextoExecucao;
}

describe("usuarios", () => {
  it("criarUsuario: valida nome", async () => {
    const repo = createUsuariosMemoryRepo();

    const r1 = await criarUsuario(
      ctxBase(),
      { usuariosRepo: repo, gerarId: () => "u1" },
      { nome: "  " },
    );
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.error.code).toBe("VALIDATION");
  });

  it("criarUsuario: exige locatarioId", async () => {
    const repo = createUsuariosMemoryRepo();

    const r = await criarUsuario(
      ctxBase({ locatarioId: undefined }),
      { usuariosRepo: repo, gerarId: () => "u1" },
      { nome: "Alice" },
    );

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNAUTHORIZED");
  });

  it("criarUsuario: cria e normaliza nome", async () => {
    const repo = createUsuariosMemoryRepo();

    const r = await criarUsuario(
      ctxBase(),
      { usuariosRepo: repo, gerarId: () => "u1" },
      { nome: "  Alice   Silva  " },
    );

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.id).toBe("u1");
      expect(r.value.nome).toBe("Alice Silva");
      expect(r.value.status).toBe("ATIVO");
    }
  });

  it("criarUsuario: impede duplicidade por nome", async () => {
    const repo = createUsuariosMemoryRepo();

    const a = await criarUsuario(
      ctxBase(),
      { usuariosRepo: repo, gerarId: () => "u1" },
      { nome: "Alice" },
    );
    expect(a.ok).toBe(true);

    const b = await criarUsuario(
      ctxBase(),
      { usuariosRepo: repo, gerarId: () => "u2" },
      { nome: "Alice" },
    );

    expect(b.ok).toBe(false);
    if (!b.ok) expect(b.error.code).toBe("CONFLICT");
  });

  it("listarUsuarios: lista", async () => {
    const repo = createUsuariosMemoryRepo();

    await criarUsuario(ctxBase(), { usuariosRepo: repo, gerarId: () => "u1" }, { nome: "Alice" });
    await criarUsuario(ctxBase(), { usuariosRepo: repo, gerarId: () => "u2" }, { nome: "Bob" });

    const r = await listarUsuarios(ctxBase(), { usuariosRepo: repo });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.map((x: Usuario) => x.nome)).toEqual(["Alice", "Bob"]);
  });
});
