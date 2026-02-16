import { describe, it, expect } from "vitest";
import { exigirPermissao, exigirAlguma, exigirTodas } from "../src/rbac";
import type { ContextoExecucao, Permissao } from "../src/locatario";

describe("RBAC", () => {
  const ctxBase: ContextoExecucao = {
    locatarioId: "loc-1",
    usuarioId: "usr-1",
    permissoes: ["usuarios:criar", "usuarios:listar"],
  };

  it("exigirPermissao() permite quando possui permissão", () => {
    const r = exigirPermissao(ctxBase, "usuarios:criar");

    expect(r).toEqual({ ok: true, value: undefined });
    expect(JSON.parse(JSON.stringify(r))).toEqual({ ok: true });
  });

  it("exigirPermissao() nega quando não possui permissão (FORBIDDEN + details)", () => {
    const r = exigirPermissao(ctxBase, "usuarios:editar");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toEqual({
        code: "NAO_AUTORIZADO",
        message: "Permissões insuficientes.",
        details: { permissaoExigida: "usuarios:editar" },
        cause: undefined,
      });

      // serializável de forma previsível
      expect(JSON.parse(JSON.stringify(r.error))).toEqual({
        code: "NAO_AUTORIZADO",
        message: "Permissões insuficientes.",
        details: { permissaoExigida: "usuarios:editar" },
      });
    }
  });

  it("exigirPermissao() retorna NAO_AUTORIZADO quando ctx.permissoes está ausente", () => {
    const ctxSemPerm: ContextoExecucao = {
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      permissoes: undefined,
    };

    const r = exigirPermissao(ctxSemPerm, "usuarios:listar");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
      expect(r.error.mensagem).toBe("Usuário não autenticado.");
    }
  });

  it("exigirTodas() permite quando possui todas", () => {
    const r = exigirTodas(ctxBase, ["usuarios:criar", "usuarios:listar"]);
    expect(r).toEqual({ ok: true, value: undefined });
  });

  it("exigirTodas() nega quando falta alguma (primeira faltante)", () => {
    const r = exigirTodas(ctxBase, ["usuarios:criar", "usuarios:editar"]);

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
      expect(r.error.mensagem).toBe("Permissões insuficientes.");
      expect(r.error.detalhes).toEqual({ permissaoExigida: "usuarios:editar" });
    }
  });

  it("exigirAlguma() permite quando possui pelo menos uma", () => {
    const r = exigirAlguma(ctxBase, ["usuarios:editar", "usuarios:listar"]);
    expect(r).toEqual({ ok: true, value: undefined });
  });

  it("exigirAlguma() nega quando não possui nenhuma (details com join '|')", () => {
    const r = exigirAlguma(ctxBase, ["usuarios:editar", "usuarios:remover"]);

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
      expect(r.error.detalhes).toEqual({
        permissaoExigida: "usuarios:editar|usuarios:remover",
      });
    }
  });

  it("exigirAlguma() trata lista vazia como falha (permissaoExigida vazio)", () => {
    const r = exigirAlguma(ctxBase, [] as Permissao[]);

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
      expect(r.error.detalhes).toEqual({ permissaoExigida: "" });
    }
  });
});
