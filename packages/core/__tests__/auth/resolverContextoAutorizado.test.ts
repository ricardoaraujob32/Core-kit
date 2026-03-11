import { describe, expect, it } from "vitest";
import { criarResolverContextoAutorizado } from "../../src/auth/usecases/resolverContextoAutorizado";

describe("auth - resolverContextoAutorizado", () => {
  it("cria contexto e resolve permissões com sucesso", async () => {
    const resolverContextoAutorizado = criarResolverContextoAutorizado({
      rbac: {
        async resolverPermissoes(ctx: any) {
          return {
            ok: true as const,
            value: {
              ...ctx,
              permissoes: ["cliente.ler"],
              papeis: ["ADMIN"],
            },
          };
        },
      },
    });

    const r = await resolverContextoAutorizado({
      sessao: {
        usuarioId: "usr-1",
        locatarioId: "tenant-1",
        sessionId: "sess-1",
        expiraEm: new Date("2026-03-06T12:10:00.000Z"),
      },
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.usuarioId).toBe("usr-1");
      expect(r.value.locatarioId).toBe("tenant-1");
      expect(r.value.permissoes).toContain("cliente.ler");
    }
  });

  it("propaga erro do RBAC", async () => {
    const resolverContextoAutorizado = criarResolverContextoAutorizado({
      rbac: {
        async resolverPermissoes() {
          return {
            ok: false as const,
            error: {
              codigo: "NAO_AUTORIZADO",
              mensagem: "Sem permissão",
            },
          };
        },
      },
    });

    const r = await resolverContextoAutorizado({
      sessao: {
        usuarioId: "usr-1",
        locatarioId: "tenant-1",
        sessionId: "sess-1",
        expiraEm: new Date("2026-03-06T12:10:00.000Z"),
      },
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
    }
  });
});