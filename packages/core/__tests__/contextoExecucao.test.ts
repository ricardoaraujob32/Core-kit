import { describe, it, expect } from "vitest";
import { wrapOk, wrapErr, isErr, isOk } from "../src/result";
import type { Permissao } from "../src/autorizacao/permissoes";
import type { Papel } from "../src/autorizacao/papeis";
import type { UsuarioId } from "../src/usuarios/tipos";
import type { LocatarioId } from "../src/locatario";
import { normalizarRelogio, exigirPermissao, exigirUsuario, normalizarPapeis, normalizarPermissoes, possuiPermissao, temUsuario, type ContextoExecucao } from "../src/contextoExecucao";

describe("contextoExecucao", () => {
  const locatarioId = "loc-1" as LocatarioId;
  const usuarioId = "usr-1" as UsuarioId;

  it("temUsuario: true quando usuarioId é string não vazia", () => {
    const ctx: ContextoExecucao = { locatarioId, usuarioId };
    expect(temUsuario(ctx)).toBe(true);
  });

  it("temUsuario: false quando usuarioId é undefined", () => {
    const ctx: ContextoExecucao = { locatarioId };
    expect(temUsuario(ctx)).toBe(false);
  });

  it("temUsuario: false quando usuarioId é null (contexto técnico)", () => {
    const ctx: ContextoExecucao = { locatarioId, usuarioId: null };
    expect(temUsuario(ctx)).toBe(false);
  });

  it("permissoesDo/papeisDo: sempre retornam array", () => {
    const ctx: ContextoExecucao = { locatarioId };
    expect(normalizarPermissoes(ctx)).toEqual([]);
    expect(normalizarPapeis(ctx)).toEqual([]);
  });

  it("agoraDo: usa relógio injetável quando presente", () => {
    const fixed = new Date("2020-01-01T00:00:00.000Z");
    const ctx: ContextoExecucao = { locatarioId, agora: () => fixed };
    expect(normalizarRelogio(ctx)).toBe(fixed);
  });

  it("possuiPermissao: funciona com array normalizado", () => {
    const p: Permissao = "USUARIOS_LER";
    const ctx: ContextoExecucao = { locatarioId, permissoes: [p] };
    expect(possuiPermissao(ctx, p)).toBe(true);
  });

  it("exigirUsuario: falha com NAO_AUTENTICADO quando usuário ausente", () => {
    const ctx: ContextoExecucao = { locatarioId };
    const r = exigirUsuario(ctx);

    expect(isErr(r)).toBe(true);
    if (isErr(r)) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
      expect(r.error.mensagem.length).toBeGreaterThan(0);
    }
  });

  it("exigirPermissao: falha com NAO_AUTENTICADO quando usuário ausente", () => {
    const ctx: ContextoExecucao = { locatarioId };
    const r = exigirPermissao(ctx, "USUARIOS_LER");

    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.codigo).toBe("NAO_AUTENTICADO");
  });

  it("exigirPermissao: falha com NAO_AUTORIZADO quando autenticado sem permissão", () => {
    const ctx: ContextoExecucao = { locatarioId, usuarioId, permissoes: [] };
    const r = exigirPermissao(ctx, "USUARIOS_LER");

    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.codigo).toBe("NAO_AUTORIZADO");
  });

  it("exigirPermissao: ok quando autenticado e tem a permissão", () => {
    const ctx: ContextoExecucao = {
      locatarioId,
      usuarioId,
      permissoes: ["USUARIOS_LER"],
    };
    const r = exigirPermissao(ctx, "USUARIOS_LER");

    expect(isOk(r)).toBe(true);
  });

  it("permissoesDo deve retornar [] quando ctx.permissoes for undefined", () => {
    const ctx: ContextoExecucao = { locatarioId };
    expect(normalizarPermissoes(ctx)).toEqual([]);
  });

  it("papeisDo deve retornar [] quando ctx.papeis for undefined", () => {
    const ctx: ContextoExecucao = { locatarioId };
    expect(normalizarPapeis(ctx)).toEqual([]);
  });

  it("temUsuario deve ser false quando usuarioId for undefined", () => {
    const ctx: ContextoExecucao = { locatarioId };
    expect(temUsuario(ctx)).toBe(false);
  });

  it("temUsuario deve ser true quando usuarioId for string não vazia", () => {
    const usuarioId: UsuarioId = "u-1";
    const ctx: ContextoExecucao = { locatarioId, usuarioId };
    expect(temUsuario(ctx)).toBe(true);
  });

  it("agoraDo deve usar ctx.agora() quando fornecido", () => {
    const fixed = new Date("2020-01-01T00:00:00.000Z");
    const ctx: ContextoExecucao = { locatarioId, agora: () => fixed };
    expect(normalizarRelogio(ctx)).toBe(fixed);
  });

  it("agoraDo deve cair para new Date() quando não houver relógio injetado", () => {
    const ctx: ContextoExecucao = { locatarioId };
    const d = normalizarRelogio(ctx);
    expect(d).toBeInstanceOf(Date);
  });

  it("comPermissoes deve fazer merge e remover duplicatas", () => {
    const p1: Permissao = "USUARIOS_LER";
    const p2: Permissao = "USUARIOS_CRIAR";

    const base: ContextoExecucao = { locatarioId, permissoes: [p1] };
    const novo = comPermissoes(base, [p1, p2]);

    expect(novo.permissoes).toEqual([p1, p2]);
    expect(base.permissoes).toEqual([p1]); // imutável
  });

  it("comPapeis deve fazer merge e remover duplicatas", () => {
    const r1: Papel = "ADMIN";
    const r2: Papel = "LEITOR";

    const base: ContextoExecucao = { locatarioId, papeis: [r1] };
    const novo = comPapeis(base, [r1, r2]);

    expect(novo.papeis).toEqual([r1, r2]);
    expect(base.papeis).toEqual([r1]); // imutável
  });

  it("cria contexto público (usuarioId undefined) e preserva semântica", () => {
    const ctx = criarContextoExecucao({ locatarioId: "t1" });

    expect(ctx.locatarioId).toBe("t1");
    expect(ctx.usuarioId).toBeUndefined();
    expect(temUsuario(ctx)).toBe(false);
    expect(ctx.permissoes).toBeUndefined();
    expect(normalizarPermissoes(ctx)).toEqual([]);
    expect(normalizarPapeis(ctx)).toEqual([]);
    expect(isContextoExecucao(ctx)).toBe(true);
  });

  it("cria contexto técnico (usuarioId null) e preserva semântica", () => {
    const ctx = criarContextoExecucao({ locatarioId: "t1", usuarioId: null });

    expect(ctx.usuarioId).toBeNull();
    expect(temUsuario(ctx)).toBe(false);
    expect(ctx.permissoes).toBeUndefined();
  });

  it("temUsuario só é true quando usuarioId é string não vazia", () => {
    const a = criarContextoExecucao({ locatarioId: "t1" });
    const b = criarContextoExecucao({ locatarioId: "t1", usuarioId: null });
    const c = criarContextoExecucao({ locatarioId: "t1", usuarioId: "" });
    const d = criarContextoExecucao({ locatarioId: "t1", usuarioId: "u1" });

    expect(temUsuario(a)).toBe(false);
    expect(temUsuario(b)).toBe(false);
    expect(temUsuario(c)).toBe(false);
    expect(temUsuario(d)).toBe(true);
  });

  it("agoraDo usa relógio injetado quando fornecido; senão fallback", () => {
    const fakeNow = new Date("2020-01-01T00:00:00.000Z");
    const ctx1 = criarContextoExecucao({
      locatarioId: "t1",
      agora: () => fakeNow,
    });
    expect(normalizarRelogio(ctx1).toISOString()).toBe(fakeNow.toISOString());

    const ctx2 = criarContextoExecucao({ locatarioId: "t1" });
    const v = normalizarRelogio(ctx2);
    expect(v).toBeInstanceOf(Date);
  });

  it("comPermissoes cria novo contexto imutável e mantém branding", () => {
    const base = criarContextoExecucao({ locatarioId: "t1", usuarioId: "u1" });

    const ctx = comPermissoes(base, ["USUARIOS_LER"] as any);

    expect(ctx).not.toBe(base);
    expect(ctx.locatarioId).toBe("t1");
    expect(ctx.usuarioId).toBe("u1");
    expect(normalizarPermissoes(ctx)).toEqual(["USUARIOS_LER"]);

    // branding continua
    expect(isContextoExecucao(ctx)).toBe(true);

    // imutável (não deve permitir mutação acidental)
    expect(Object.isFrozen(ctx)).toBe(true);
    expect(Object.isFrozen(ctx.permissoes)).toBe(true);
  });

  it("comPapeis cria novo contexto e mantém branding", () => {
    const base = criarContextoExecucao({ locatarioId: "t1", usuarioId: "u1" });
    const ctx = comPapeis(base, ["ADMIN"] as any);

    expect(ctx).not.toBe(base);
    expect(normalizarPapeis(ctx)).toEqual(["ADMIN"]);
    expect(isContextoExecucao(ctx)).toBe(true);
    expect(Object.isFrozen(ctx)).toBe(true);
    expect(Object.isFrozen(ctx.papeis)).toBe(true);
  });

  it("isContextoExecucao rejeita objeto 'na mão' (sem construtor)", () => {
    const fake: ContextoExecucao = {
      locatarioId: "t1",
      usuarioId: "u1",
      permissoes: [],
      papeis: [],
    };

    expect(isContextoExecucao(fake)).toBe(false);
  });
});
