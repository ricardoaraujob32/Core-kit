import { describe, expect, it } from "vitest";
import { autorizarOperacao } from "../usecases/autorizarOperacao";

describe("autorizarOperacao", () => {
  it("autoriza quando usuário possui a permissão", () => {
    const resultado = autorizarOperacao({
      ctx: {
        locatarioId: "loc-1",
        usuarioId: "user-1",
        permissoes: ["tenant.usuario.listar"],
      },
      permissao: "tenant.usuario.listar",
    });

    expect(resultado.ok).toBe(true);
  });

  it("falha quando usuário não possui a permissão", () => {
    const resultado = autorizarOperacao({
      ctx: {
        locatarioId: "loc-1",
        usuarioId: "user-1",
        permissoes: ["tenant.usuario.criar"],
      },
      permissao: "tenant.usuario.listar",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("RBAC_NAO_AUTORIZADO");
  });

  it("falha quando não há usuário autenticado", () => {
    const resultado = autorizarOperacao({
      ctx: {
        locatarioId: "loc-1",
        permissoes: ["tenant.usuario.listar"],
      },
      permissao: "tenant.usuario.listar",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("RBAC_NAO_AUTENTICADO");
  });

  it("falha quando a permissão pedida é inválida", () => {
    const resultado = autorizarOperacao({
      ctx: {
        locatarioId: "loc-1",
        usuarioId: "user-1",
        permissoes: ["tenant.usuario.listar"],
      },
      permissao: " ",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("RBAC_PERMISSAO_INVALIDA");
  });
});