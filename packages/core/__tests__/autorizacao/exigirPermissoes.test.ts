import { describe, it, expect } from "vitest";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { isOk, isErr } from "../../src/result";
import { exigirPermissao, exigirAlguma, exigirTodas } from "../../src/rbac"; // ou de onde você exporta

describe("RBAC wrappers", () => {
  it("exigirPermissao: ok quando tiver permissão", () => {
    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_LER"],
    });

    const r = exigirPermissao(ctx, "ESTOQUE_LER");
    expect(isOk(r)).toBe(true);
  });

  it("exigirPermissao: NAO_AUTENTICADO quando sem usuarioId", () => {
    const ctx = createContextoExecucao({ locatarioId: "L1" });

    const r = exigirPermissao(ctx, "ESTOQUE_LER");
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.codigo).toBe("NAO_AUTENTICADO");
  });

  it("exigirAlguma: ok se tiver pelo menos uma", () => {
    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["A"],
    });

    const r = exigirAlguma(ctx, ["A", "B"]);
    expect(isOk(r)).toBe(true);
  });

  it("exigirAlguma: NAO_AUTORIZADO se não tiver nenhuma", () => {
    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["A"],
    });

    const r = exigirAlguma(ctx, ["B", "C"]);
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.codigo).toBe("NAO_AUTORIZADO");
  });

  it("exigirTodas: ok se tiver todas", () => {
    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["A", "B", "C"],
    });

    const r = exigirTodas(ctx, ["A", "C"]);
    expect(isOk(r)).toBe(true);
  });

  it("exigirTodas: NAO_AUTORIZADO se faltar alguma", () => {
    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["A"],
    });

    const r = exigirTodas(ctx, ["A", "B"]);
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.codigo).toBe("NAO_AUTORIZADO");
  });
});
