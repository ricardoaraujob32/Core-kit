import { describe, it, expect } from "vitest";
import { exigirAlguma, exigirTodas } from "../src/rbac";
import { Permissao } from "../src/autorizacao/permissoes";
import { createContextoExecucao, ContextoExecucao, possuiPermissao } from "../src/contextoExecucao";
import { isErr, isOk } from "../src/result";

describe("RBAC / autorizar", () => {
  it("deve autorizar quando permissão existir", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      permissoes: ["ESTOQUE_LER"],
    });

    const r = possuiPermissao(ctx, "ESTOQUE_LER");

    expect(isOk(r)).toBe(true);
  });

  it("deve negar quando permissão não existir", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      permissoes: ["ESTOQUE_LER"],
    });

    const r = possuiPermissao(ctx, "ESTOQUE_ESCREVER");

    expect(isErr(r)).toBe(true);
  });

  it("deve negar quando contexto não tiver permissões", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
    });

    const r = autorizar(ctx, "ESTOQUE_LER");

    expect(isErr(r)).toBe(true);
  });

  it("erro deve conter código padronizado", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
    });

    const r = possuiPermissao(ctx, "ESTOQUE_LER");

    if (isErr(r)) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
    }
  });

  it("deve funcionar com múltiplas permissões", () => {
    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      permissoes: ["CLIENTES_LISTAR", "AUDITORIA_LER", "ESTOQUE_LER"],
    });

    const r = possuiPermissao(ctx, "USUARIOS_CRIAR");

    expect(isOk(r)).toBe(true);
  });

  it("deve negar como NAO_AUTENTICADO quando não há usuarioId", () => {
    const ctx = createContextoExecucao({ locatarioId: "L1" }); // usuarioId undefined
    const r = autorizar(ctx, "ESTOQUE_LER");

    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.codigo).toBe("NAO_AUTENTICADO");
  });

  it("deve autorizar quando permissão existir", () => {
    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_LER"],
    });

    const r = possuiPermissao(ctx, "ESTOQUE_LER");
    expect(isOk(r)).toBe(true);
  });

  it("deve negar como NAO_AUTORIZADO quando faltar permissão", () => {
    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_LER"],
    });

    const r = possuiPermissao(ctx, "ESTOQUE_ESCREVER");
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
