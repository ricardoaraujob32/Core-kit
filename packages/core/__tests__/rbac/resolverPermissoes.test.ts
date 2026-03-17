import { describe, expect, it } from "vitest";
import { criarResolverPermissoes } from "../usecases/resolverPermissoes";
import { criarRbacRepositorioMemoria } from "../repositorioMemoria";

describe("resolverPermissoes", () => {
  it("resolve papéis e permissões do usuário", async () => {
    const repo = criarRbacRepositorioMemoria([
      {
        locatarioId: "loc-1",
        usuarioId: "user-1",
        papeis: ["ADMIN"],
        permissoes: ["tenant.usuario.listar", "tenant.usuario.criar"],
      },
    ]);

    const usecase = criarResolverPermissoes({
      rbacRepo: repo,
    });

    const resultado = await usecase({
      ctx: {
        locatarioId: "loc-1",
        usuarioId: "user-1",
      },
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.papeis).toEqual(["ADMIN"]);
    expect(resultado.value.permissoes).toEqual([
      "tenant.usuario.listar",
      "tenant.usuario.criar",
    ]);
    expect(resultado.value.ctx.papeis).toEqual(["ADMIN"]);
    expect(resultado.value.ctx.permissoes).toEqual([
      "tenant.usuario.listar",
      "tenant.usuario.criar",
    ]);
  });

  it("usa cache ao resolver permissões no mesmo contexto", async () => {
    const repo = criarRbacRepositorioMemoria([
      {
        locatarioId: "loc-1",
        usuarioId: "user-1",
        papeis: ["ADMIN"],
        permissoes: ["tenant.usuario.listar"],
      },
    ]);

    const usecase = criarResolverPermissoes({
      rbacRepo: repo,
    });

    const ctx = {
      locatarioId: "loc-1",
      usuarioId: "user-1",
    };

    const r1 = await usecase({ ctx });
    const r2 = await usecase({ ctx });

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);

    const stats = repo.stats();
    expect(stats.listarPapeisDoUsuario).toBe(1);
    expect(stats.listarPermissoesEfetivasDoUsuario).toBe(1);
  });

  it("falha sem usuário autenticado", async () => {
    const repo = criarRbacRepositorioMemoria();
    const usecase = criarResolverPermissoes({ rbacRepo: repo });

    const resultado = await usecase({
      ctx: {
        locatarioId: "loc-1",
      },
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("RBAC_NAO_AUTENTICADO");
  });
});