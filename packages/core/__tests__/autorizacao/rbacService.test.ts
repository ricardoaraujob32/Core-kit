// packages/core/__tests__/autorizacao/rbacService.test.ts
import { describe, it, expect } from "vitest";

import { createContextoExecucao } from "../../src/contextoExecucao";
import type { Permissao } from "../../src/autorizacao/permissoes";
import { wrapOk } from "../../src/result";

// A SER IMPLEMENTADO
import { criarRbacService } from "../../src/autorizacao/rbacService";

type UsuarioId = string;
type LocatarioId = string;

describe("RBAC - rbacService", () => {
  it("resolve permissões efetivas do usuário (papéis -> permissões) e retorna Set", async () => {
    const repo = {
      async listarPermissoesDoUsuario(params: { locatarioId: LocatarioId; usuarioId: UsuarioId }) {
        // simula join usuarios_papeis -> papel_permissoes -> permissoes
        const { locatarioId, usuarioId } = params;
        if (locatarioId === "loc-1" && usuarioId === "usr-1") {
          const perms: Permissao[] = ["USUARIOS_LER", "SESSAO_RENOVAR", "ESTOQUE_LER"];
          return wrapOk(perms);
        }
        return wrapOk([] as Permissao[]);
      },
    };

    const rbac = criarRbacService({ repo });

    const r = await rbac.resolverPermissoesEfetivas({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value instanceof Set).toBe(true);
      expect(r.value.has("USUARIOS_LER")).toBe(true);
      expect(r.value.has("SESSAO_RENOVAR")).toBe(true);
      expect(r.value.has("ESTOQUE_LER")).toBe(true);
    }
  });

  it("exigirPermissao falha com NAO_AUTENTICADO quando ContextoExecucao não tem usuário", async () => {
    const repo = {
      async listarPermissoesDoUsuario() {
        return wrapOk([] as Permissao[]);
      },
    };

    const rbac = criarRbacService({ repo });

    const ctxAnon = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: undefined,
    });

    const r = await rbac.exigirPermissao(ctxAnon, "USUARIOS_LER");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("exigirPermissao falha com NAO_AUTORIZADO quando usuário não tem a permissão", async () => {
    const repo = {
      async listarPermissoesDoUsuario(params: { locatarioId: LocatarioId; usuarioId: UsuarioId }) {
        if (params.usuarioId === "usr-1") return wrapOk(["USUARIOS_LER"] as Permissao[]);
        return wrapOk([] as Permissao[]);
      },
    };

    const rbac = criarRbacService({ repo });

    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    const r = await rbac.exigirPermissao(ctx, "USUARIOS_EDITAR");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
      expect(r.error.mensagem.toLowerCase()).toContain("permiss");
    }
  });

  it("exigirPermissao retorna Ok(void) quando usuário tem a permissão", async () => {
    const repo = {
      async listarPermissoesDoUsuario() {
        return wrapOk(["SESSAO_RENOVAR"] as Permissao[]);
      },
    };

    const rbac = criarRbacService({ repo });

    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    const r = await rbac.exigirPermissao(ctx, "SESSAO_RENOVAR");

    expect(r.ok).toBe(true);
  });

  it("cache de permissões por request: resolverPermissoesEfetivas deve ser chamado no máximo 1x se exigirPermissao for chamada 2x com mesmo ctx", async () => {
    let chamadas = 0;

    const repo = {
      async listarPermissoesDoUsuario() {
        chamadas += 1;
        return wrapOk(["USUARIOS_LER", "USUARIOS_EDITAR"] as Permissao[]);
      },
    };

    const rbac = criarRbacService({ repo });

    const ctx = createContextoExecucao({
      locatarioId: "loc-1",
      usuarioId: "usr-1",
    });

    const a = await rbac.exigirPermissao(ctx, "USUARIOS_LER");
    const b = await rbac.exigirPermissao(ctx, "USUARIOS_EDITAR");

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(chamadas).toBe(1);
  });
});