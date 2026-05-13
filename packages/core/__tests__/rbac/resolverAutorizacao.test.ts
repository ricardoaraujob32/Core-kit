// packages/core/__tests__/rbac/resolverAutorizacao.test.ts

import { describe, expect, it } from "vitest";
import { createFnResolverAutorizacao } from "../../src/rbac/usecases/resolverAutorizacao";
import { Permissoes } from "../../src/rbac";
import { criarContextoAutenticado } from "./helpers/rbacUsecaseTestUtils";
import { criarRbacSimulacroRepositorio } from "./simulacros/rbacSimulacroRepositorio";


describe("#1 - createFnResolverAutorizacao", () => {
  it("#1.1 - deve resolver snapshot completo de autorização", async () => {
    const repo = criarRbacSimulacroRepositorio({
      permissoes: [Permissoes.TENANT_USUARIO_LISTAR],
      papeis: ["ADMIN"],
      modulos: ["VENDAS"],
    });

    const usecase = createFnResolverAutorizacao({
      autorizacaoRepositorio: repo,
    });

    const resultado = await usecase({
      ctx: criarContextoAutenticado(),
    });

    expect(resultado.ok).toBe(true);

    if (resultado.ok) {
      expect(resultado.value.ctx.permissoes).toEqual([
        Permissoes.TENANT_USUARIO_LISTAR,
      ]);
      expect(resultado.value.ctx.papeis).toEqual(["ADMIN"]);
      expect(resultado.value.ctx.modulosHabilitados).toEqual(["VENDAS"]);
    }
  });

  it("#1.2 - deve propagar falha do repositório ao obter snapshot", async () => {
    const repo = criarRbacSimulacroRepositorio();
    repo.simularFalha("obterSnapshot");

    const usecase = createFnResolverAutorizacao({
      autorizacaoRepositorio: repo,
    });

    const resultado = await usecase({
      ctx: criarContextoAutenticado(),
    });

    expect(resultado.ok).toBe(false);

    if (!resultado.ok) {
      expect(resultado.error.detalhes?.simulada).toBe(true);
    }
  });
});