// packages/core/__tests__/auth/resolverContextoAutorizado.test.ts

import { describe, expect, it } from "vitest";
import { createFnResolverContextoAutorizado } from "../../src/auth";
import { criarRbacAuthPortaFake } from "./fakes/rbacAuthPortaFake";


describe("#1 - createFnResolverContextoAutorizado", () => {
  it("#1.1 - deve criar contexto e resolver permissões via RBAC", async () => {
    const rbac = criarRbacAuthPortaFake();

    const usecase = createFnResolverContextoAutorizado({
      rbacPorta: rbac.porta,
    });

    const resultado = await usecase({
      sessao: {
        locatarioId: "loc-1",
        usuarioId: "usr-1",
        sessionId: "sess-1",
        expiraEm: new Date("2026-03-12T11:00:00.000Z"),
      },
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.ctx.locatarioId).toBe("loc-1");
      expect(resultado.value.ctx.usuarioId).toBe("usr-1");
    }

    expect(rbac.chamadas()).toBe(1);
  });

  it("#1.2 - deve propagar falha do RBAC", async () => {
    const rbac = criarRbacAuthPortaFake({ falhar: true });

    const usecase = createFnResolverContextoAutorizado({
      rbacPorta: rbac.porta,
    });

    const resultado = await usecase({
      sessao: {
        locatarioId: "loc-1",
        usuarioId: "usr-1",
        sessionId: "sess-1",
        expiraEm: new Date("2026-03-12T11:00:00.000Z"),
      },
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});