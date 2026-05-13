// packages/core/__tests__/rbac/resolverPermissoes.test.ts

import { describe, expect, it } from "vitest";
import { createFnResolverPermissoes } from "../../src/rbac/usecases/resolverPermissoes";
import { Permissoes } from "../../src/rbac";
import { criarRbacSimulacroRepositorio } from "./simulacros/rbacSimulacroRepositorio";
import { criarContextoAutenticado } from "./helpers/rbacUsecaseTestUtils";

describe("#1 - createFnResolverPermissoes", () => {
  it("#1.1 - deve resolver permissões e papéis do usuário autenticado", async () => {
    const repo = criarRbacSimulacroRepositorio({
      permissoes: [Permissoes.TENANT_USUARIO_LISTAR],
      papeis: ["ADMIN"],
    });

    const usecase = createFnResolverPermissoes({
      rbacRepositorio: repo,
    });

    const resultado = await usecase({
      ctx: criarContextoAutenticado(),
    });

    expect(resultado.ok).toBe(true);

    if (resultado.ok) {
      expect(resultado.value.permissoes).toEqual([
        Permissoes.TENANT_USUARIO_LISTAR,
      ]);
      expect(resultado.value.papeis).toEqual(["ADMIN"]);
      expect(resultado.value.ctx.permissoes).toEqual([
        Permissoes.TENANT_USUARIO_LISTAR,
      ]);
      expect(resultado.value.ctx.papeis).toEqual(["ADMIN"]);
    }
  });

  it("#1.2 - deve propagar falha ao listar permissões", async () => {
    const repo = criarRbacSimulacroRepositorio();
    repo.simularFalha("listarPermissoesEfetivasDoUsuario");

    const usecase = createFnResolverPermissoes({
      rbacRepositorio: repo,
    });

    const resultado = await usecase({
      ctx: criarContextoAutenticado(),
    });

    expect(resultado.ok).toBe(false);

    if (!resultado.ok) {
      expect(resultado.error.detalhes?.simulada).toBe(true);
    }
  });

  it("#1.3 - deve propagar falha ao listar papéis", async () => {
    const repo = criarRbacSimulacroRepositorio();
    repo.simularFalha("listarPapeisDoUsuario");

    const usecase = createFnResolverPermissoes({
      rbacRepositorio: repo,
    });

    const resultado = await usecase({
      ctx: criarContextoAutenticado(),
    });

    expect(resultado.ok).toBe(false);

    if (!resultado.ok) {
      expect(resultado.error.detalhes?.simulada).toBe(true);
    }
  });

  it("#1.4 - deve usar cache para mesma referência de contexto", async () => {
    const repo = criarRbacSimulacroRepositorio();

    const usecase = createFnResolverPermissoes({
      rbacRepositorio: repo,
    });

    const ctx = criarContextoAutenticado();

    await usecase({ ctx });
    await usecase({ ctx });

    expect(repo.stats().listarPermissoesEfetivasDoUsuario).toBe(1);
    expect(repo.stats().listarPapeisDoUsuario).toBe(1);
  });
});