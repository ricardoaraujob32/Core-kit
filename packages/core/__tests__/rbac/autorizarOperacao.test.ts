import { describe, it, expect } from "vitest";
import { autorizarOperacao } from "../../src/rbac/usecases/autorizarOperacao";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { comPermissoes } from "../../src/rbac";

describe("rbac - autorizarOperacao", () => {
  it("retorna Ok quando o contexto possui a permissão exigida", () => {
    const ctxBase = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const ctx = comPermissoes(ctxBase, ["cliente.ler", "cliente.criar"]);

    const r = autorizarOperacao({
      ctx,
      permissao: "cliente.ler",
    });

    expect(r.ok).toBe(true);
  });

  it("retorna Err(NAO_AUTENTICADO) quando o contexto não possui usuarioId", () => {
    const ctx = createContextoExecucao({
      locatarioId: "tenant-1",
    });

    const r = autorizarOperacao({
      ctx,
      permissao: "cliente.ler",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("retorna Err(NAO_AUTORIZADO) quando a permissão não está presente", () => {
    const ctxBase = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const ctx = comPermissoes(ctxBase, ["cliente.listar"]);

    const r = autorizarOperacao({
      ctx,
      permissao: "cliente.excluir",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
      expect(r.error.detalhes).toMatchObject({
        permissao: "cliente.excluir",
      });
    }
  });

  it("retorna Err(INVALIDO) quando a permissão informada é vazia", () => {
    const ctxBase = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const ctx = comPermissoes(ctxBase, ["cliente.ler"]);

    const r = autorizarOperacao({
      ctx,
      permissao: "",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("não depende de papéis quando as permissões já estão resolvidas no contexto", () => {
    const ctxBase = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
      papeis: ["OPERADOR"],
    });

    const ctx = comPermissoes(ctxBase, ["cliente.ler"]);

    const r = autorizarOperacao({
      ctx,
      permissao: "cliente.ler",
    });

    expect(r.ok).toBe(true);
  });
});