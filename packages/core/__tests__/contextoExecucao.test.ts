import { describe, it, expect } from "vitest";
import { isErr, isOk } from "../src/result";
import type { Permissao } from "../src/autorizacao/permissoes";
import type { Papel } from "../src/autorizacao/papeis";
import type { UsuarioId } from "../src/usuarios/tipos";
import type { LocatarioId } from "../src/locatario";
import { normalizarRelogio, exigirPermissao, exigirUsuario, normalizarPapeis, normalizarPermissoes, possuiPermissao, temUsuario, 
         type ContextoExecucao, createContextoExecucao, isContextoExecucao, comPermissoes, comPapeis } from "../src/contextoExecucao";

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

describe("#2 - Operações", () => {
  const locatarioId = "loc-1" as LocatarioId;
  const usuarioId = "usr-1" as UsuarioId;

  it("#2.1 - temUsuario só é true quando usuarioId é string não vazia", () => {
    const c = createContextoExecucao( { locatarioId: "t1", usuarioId: "usr-1" } );

    expect(temUsuario(c)).toBe(true);
  });

  it("#2.2 - normalizar permissoes/papeis: sempre retornam array", () => {
    const ctx: ContextoExecucao = createContextoExecucao( { locatarioId } );
    expect(normalizarPermissoes(ctx)).toEqual([]);
    expect(normalizarPapeis(ctx)).toEqual([]);
  });

  it("#2.3 - normalizarRelogio usa relógio injetado quando fornecido; senão fallback", () => {
    const fakeNow = new Date("2020-01-01T00:00:00.000Z");
    const ctx1 = createContextoExecucao( {locatarioId: "t1", agora: () => fakeNow,} );
    expect(normalizarRelogio(ctx1).toISOString()).toBe(fakeNow.toISOString());

    const ctx2 = createContextoExecucao({ locatarioId: "t1" });
    const v = normalizarRelogio(ctx2);
    expect(v).toBeInstanceOf(Date);
  });

  it("#2.4 - possuiPermissao: funciona com array normalizado", () => {
    const p: Permissao = "USUARIOS_LER";
    const ctx: ContextoExecucao = createContextoExecucao( { locatarioId, permissoes: [p] });
    expect(possuiPermissao(ctx, p)).toBe(true);
  });

  it("#2.5 - exigirUsuario: falha com NAO_AUTENTICADO quando usuário ausente", () => {
    const ctx: ContextoExecucao = createContextoExecucao( { locatarioId } );
    const r = exigirUsuario(ctx);

    expect(isErr(r)).toBe(true);
    if (isErr(r)) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
      expect(r.error.mensagem.length).toBeGreaterThan(0);
    }
  });

  it("#2.6 - exigirPermissao: falha com NAO_AUTENTICADO quando usuário ausente", () => {
    const ctx: ContextoExecucao = createContextoExecucao( { locatarioId } );
    const r = exigirPermissao(ctx, "USUARIOS_LER");

    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.codigo).toBe("NAO_AUTENTICADO");
  });

  it("#2.7 - exigirPermissao: falha com NAO_AUTORIZADO quando autenticado sem permissão", () => {
    const ctx: ContextoExecucao = createContextoExecucao( { locatarioId, usuarioId, permissoes: [] } );
    const r = exigirPermissao(ctx, "USUARIOS_LER");

    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.codigo).toBe("NAO_AUTORIZADO");
  });

  it("#2.8 - exigirPermissao: ok quando autenticado e tem a permissão", () => {
    const ctx: ContextoExecucao = createContextoExecucao( {locatarioId, usuarioId, permissoes: ["USUARIOS_LER"],} );
    const r = exigirPermissao(ctx, "USUARIOS_LER");

    expect(isOk(r)).toBe(true);
  });

  it("#2.9 - comPermissoes deve fazer merge e remover duplicatas", () => {
    const p1: Permissao = "USUARIOS_LER";
    const p2: Permissao = "USUARIOS_CRIAR";

    const base: ContextoExecucao = createContextoExecucao( { locatarioId, permissoes: [p1] } );
    const novo = comPermissoes(base, [p1, p2]);

    expect(novo.permissoes).toEqual([p1, p2]);
    expect(base.permissoes).toEqual([p1]); // imutável
  });

  it("#2.10 - comPapeis deve fazer merge e remover duplicatas", () => {
    const r1: Papel = "ADMIN";
    const r2: Papel = "LEITOR";

    const base: ContextoExecucao = createContextoExecucao( { locatarioId, papeis: [r1] } );
    const novo = comPapeis(base, [r1, r2]);

    expect(novo.papeis).toEqual([r1, r2]);
    expect(base.papeis).toEqual([r1]); // imutável
  });

  it("#2.11 - cria contexto público (usuarioId undefined) e preserva semântica", () => {
    const ctx = createContextoExecucao( { locatarioId: "t1" } );

    expect(ctx.locatarioId).toBe("t1");
    expect(ctx.usuarioId).toBeUndefined();
    expect(temUsuario(ctx)).toBe(false);
    expect(ctx.permissoes).toBeUndefined();
    expect(normalizarPermissoes(ctx)).toEqual([]);
    expect(normalizarPapeis(ctx)).toEqual([]);
    expect(isContextoExecucao(ctx)).toBe(true);
  });

  it("#2.12 - comPermissoes cria novo contexto imutável e mantém branding", () => {
    const base = createContextoExecucao( { locatarioId: "t1", usuarioId: "u1" } );
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

  it("#2.13 - comPapeis cria novo contexto e mantém branding", () => {
    const base = createContextoExecucao({ locatarioId: "t1", usuarioId: "u1" });
    const ctx = comPapeis(base, ["ADMIN"] as any);

    expect(ctx).not.toBe(base);
    expect(normalizarPapeis(ctx)).toEqual(["ADMIN"]);
    expect(isContextoExecucao(ctx)).toBe(true);
    expect(Object.isFrozen(ctx)).toBe(true);
    expect(Object.isFrozen(ctx.papeis)).toBe(true);
  });
});
