import { describe, it, expect, beforeEach } from "vitest";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { criarResolverPermissoes } from "../../src/rbac/usecases/resolverPermissoes";
import { criarRbacRepositorioMemoria } from "../../src/rbac/repositorioMemoria";

describe("rbac - resolverPermissoes", () => {
  let repo: ReturnType<typeof criarRbacRepositorioMemoria>;

  beforeEach(() => {
    repo = criarRbacRepositorioMemoria();
  });

  it("retorna Ok com contexto enriquecido com permissões e papéis", async () => {
    repo.seed({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
      permissoes: ["cliente.ler", "cliente.criar"],
      papeis: ["ADMIN"],
    });

    const resolverPermissoes = criarResolverPermissoes({
      rbacRepo: repo,
    });

    const ctx = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const r = await resolverPermissoes({ ctx });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.ctx.locatarioId).toBe("tenant-1");
      expect(r.value.ctx.usuarioId).toBe("user-1");
      expect(r.value.permissoes).toEqual(["cliente.ler", "cliente.criar"]);
      expect(r.value.papeis).toEqual(["ADMIN"]);
      expect(r.value.ctx.permissoes).toEqual(["cliente.ler", "cliente.criar"]);
      expect(r.value.ctx.papeis).toEqual(["ADMIN"]);
    }
  });

  it("retorna Err(NAO_AUTENTICADO) quando o contexto não possui usuário", async () => {
    const resolverPermissoes = criarResolverPermissoes({
      rbacRepo: repo,
    });

    const ctx = createContextoExecucao({
      locatarioId: "tenant-1",
    });

    const r = await resolverPermissoes({ ctx });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTENTICADO");
    }
  });

  it("propaga erro ao listar permissões", async () => {
    const resolverPermissoes = criarResolverPermissoes({
      rbacRepo: {
        async listarPermissoesEfetivasDoUsuario() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao listar permissões",
            },
          };
        },
        async listarPapeisDoUsuario() {
          return { ok: true as const, value: [] };
        },
      },
    });

    const ctx = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const r = await resolverPermissoes({ ctx });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });

  it("propaga erro ao listar papéis", async () => {
    const resolverPermissoes = criarResolverPermissoes({
      rbacRepo: {
        async listarPermissoesEfetivasDoUsuario() {
          return { ok: true as const, value: ["cliente.ler"] };
        },
        async listarPapeisDoUsuario() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao listar papéis",
            },
          };
        },
      },
    });

    const ctx = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const r = await resolverPermissoes({ ctx });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });

  it("usa cache por ContextoExecucao e não consulta o repo novamente para o mesmo contexto", async () => {
    repo.seed({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
      permissoes: ["cliente.ler"],
      papeis: ["ADMIN"],
    });

    const resolverPermissoes = criarResolverPermissoes({
      rbacRepo: repo,
    });

    const ctx = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const r1 = await resolverPermissoes({ ctx });
    const r2 = await resolverPermissoes({ ctx });

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);

    const stats = repo.stats();
    expect(stats.listarPermissoesEfetivasDoUsuario).toBe(1);
    expect(stats.listarPapeisDoUsuario).toBe(1);
  });

  it("não reutiliza cache quando o contexto é outro objeto", async () => {
    repo.seed({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
      permissoes: ["cliente.ler"],
      papeis: ["ADMIN"],
    });

    const resolverPermissoes = criarResolverPermissoes({
      rbacRepo: repo,
    });

    const ctx1 = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const ctx2 = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const r1 = await resolverPermissoes({ ctx: ctx1 });
    const r2 = await resolverPermissoes({ ctx: ctx2 });

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);

    const stats = repo.stats();
    expect(stats.listarPermissoesEfetivasDoUsuario).toBe(2);
    expect(stats.listarPapeisDoUsuario).toBe(2);
  });

  it("preserva a imutabilidade: não muta o contexto original", async () => {
    repo.seed({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
      permissoes: ["cliente.ler"],
      papeis: ["ADMIN"],
    });

    const resolverPermissoes = criarResolverPermissoes({
      rbacRepo: repo,
    });

    const ctxOriginal = createContextoExecucao({
      locatarioId: "tenant-1",
      usuarioId: "user-1",
    });

    const r = await resolverPermissoes({ ctx: ctxOriginal });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(ctxOriginal.permissoes).toBeUndefined();
      expect(ctxOriginal.papeis).toBeUndefined();

      expect(r.value.ctx).not.toBe(ctxOriginal);
      expect(r.value.ctx.permissoes).toEqual(["cliente.ler"]);
      expect(r.value.ctx.papeis).toEqual(["ADMIN"]);
    }
  });
});