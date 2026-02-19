import { describe, it, expect } from "vitest";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { isOk, isErr } from "../../src/result";
import { criarRepositorioUsuariosEmMemoria } from "../../src/usuarios/repositorioMemoria";
import { criarUsuario } from "../../src/usuarios/usecases/criarUsuario";
import { listarUsuarios } from "../../src/usuarios/usecases/listarUsuarios";

describe("Usuários - casos de uso", () => {
  it("criarUsuario deve falhar se nome inválido", async () => {
    const usuariosRepo = criarRepositorioUsuariosEmMemoria();
    const auditoria = { registrar: async () => {} } as any;

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["USUARIOS_CRIAR"],
      agora: () => new Date("2020-01-01T00:00:00.000Z"),
    });

    const r = await criarUsuario(ctx, { usuariosRepo, auditoria }, { nome: "" });
    expect(isErr(r)).toBe(true);
  });

  it("criarUsuario deve criar e impedir duplicidade por nome no mesmo locatário", async () => {
    const usuariosRepo = criarRepositorioUsuariosEmMemoria();
    const auditoria = { registrar: async () => {} } as any;

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["USUARIOS_CRIAR"],
      agora: () => new Date("2020-01-01T00:00:00.000Z"),
    });

    const a = await criarUsuario(ctx, { usuariosRepo, auditoria }, { nome: "  João   Silva " });
    expect(isOk(a)).toBe(true);

    const b = await criarUsuario(ctx, { usuariosRepo, auditoria }, { nome: "João Silva" });
    expect(isErr(b)).toBe(true);
  });

  it("listarUsuarios deve exigir permissão e retornar lista", async () => {
    const usuariosRepo = criarRepositorioUsuariosEmMemoria();
    const auditoria = { registrar: async () => {} } as any;

    const ctxCriar = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["USUARIOS_CRIAR", "USUARIOS_LER"],
      agora: () => new Date(),
    });

    await criarUsuario(ctxCriar, { usuariosRepo, auditoria }, { nome: "Ana Maria" });

    const r = await listarUsuarios(ctxCriar, { usuariosRepo });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value.itens.length).toBe(1);
  });

  it("listarUsuarios deve falhar sem permissão", async () => {
    const usuariosRepo = criarRepositorioUsuariosEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: [],
      agora: () => new Date(),
    });

    const r = await listarUsuarios(ctx, { usuariosRepo });
    expect(isErr(r)).toBe(true);
  });
});
