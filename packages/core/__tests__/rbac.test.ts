import { describe, it, expect } from "vitest";
import { exigirPermissao, exigirAlguma, exigirTodas } from "../src/rbac";
import type { ContextoExecucao } from "../src/locatario";

describe("RBAC", () => {
  const ctxBase: ContextoExecucao = {
    locatarioId: "loc-1",
    usuarioId: "usr-1",
    permissoes: ["usuarios:criar", "usuarios:listar"],
  };

  it("permite quando possui permissão", () => {
    const r = exigirPermissao(ctxBase, "usuarios:criar");
    expect(r.ok).toBe(true);
  });

  it("nega quando não possui permissão", () => {
    const r = exigirPermissao(ctxBase, "usuarios:editar");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("FORBIDDEN");
    }
  });

  it("exige todas as permissões", () => {
    const r = exigirTodas(ctxBase, ["usuarios:criar", "usuarios:listar"]);
    expect(r.ok).toBe(true);
  });

  it("exige alguma permissão", () => {
    const r = exigirAlguma(ctxBase, ["usuarios:editar", "usuarios:listar"]);
    expect(r.ok).toBe(true);
  });
});
