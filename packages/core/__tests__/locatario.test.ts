import { describe, it, expect } from "vitest";

import {
  PAPEIS_PADRAO,
  permissao,
  temUsuario,
  permissoesDo,
  papeisDo,
  type ContextoExecucao,
} from "../src/locatario";

describe("locatario", () => {
  it("permissao(recurso,acao) gera '<recurso>:<acao>'", () => {
    expect(permissao("usuarios", "criar")).toBe("usuarios:criar");
    expect(permissao("locatario", "configurar")).toBe("locatario:configurar");
  });

  it("PAPEIS_PADRAO expõe papéis padrão (inclui GERENTE)", () => {
    expect(PAPEIS_PADRAO.ADMIN).toBe("ADMIN");
    expect(PAPEIS_PADRAO.GERENTE).toBe("GERENTE");
    expect(PAPEIS_PADRAO.OPERADOR).toBe("OPERADOR");
    expect(PAPEIS_PADRAO.LEITOR).toBe("LEITOR");
  });

  it("temUsuario(ctx) é true apenas quando usuarioId é string não-vazia", () => {
    const base: ContextoExecucao = { locatarioId: "loc-1" };

    expect(temUsuario(base)).toBe(false);
    expect(temUsuario({ ...base, usuarioId: "" })).toBe(false);

    const ctxAuth: ContextoExecucao = { ...base, usuarioId: "usr-1" };
    expect(temUsuario(ctxAuth)).toBe(true);

    // type-guard: quando true, usuarioId existe
    if (temUsuario(ctxAuth)) {
      expect(ctxAuth.usuarioId).toBe("usr-1");
    }
  });

  it("permissoesDo(ctx) normaliza para array (undefined => [])", () => {
    const ctx: ContextoExecucao = { locatarioId: "loc-1" };
    expect(permissoesDo(ctx)).toEqual([]);

    const ctx2: ContextoExecucao = {
      locatarioId: "loc-1",
      permissoes: ["usuarios:listar", "usuarios:criar"],
    };
    expect(permissoesDo(ctx2)).toEqual(["usuarios:listar", "usuarios:criar"]);
  });

  it("papeisDo(ctx) normaliza para array (undefined => [])", () => {
    const ctx: ContextoExecucao = { locatarioId: "loc-1" };
    expect(papeisDo(ctx)).toEqual([]);

    const ctx2: ContextoExecucao = {
      locatarioId: "loc-1",
      papeis: ["ADMIN", "GERENTE"],
    };
    expect(papeisDo(ctx2)).toEqual(["ADMIN", "GERENTE"]);
  });
});
