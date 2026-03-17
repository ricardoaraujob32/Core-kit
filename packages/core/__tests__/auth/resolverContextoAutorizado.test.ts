import { describe, expect, it } from "vitest";
import { criarResolverContextoAutorizado } from "../usecases/resolverContextoAutorizado";

describe("resolverContextoAutorizado", () => {
  it("resolve contexto autorizado via RBAC", async () => {
    const usecase = criarResolverContextoAutorizado({
      rbacPorta: {
        async resolverPermissoes(ctx) {
          return {
            ok: true,
            value: {
              ctx: {
                ...ctx,
                papeis: ["ADMIN"],
                permissoes: ["tenant.usuario.listar"],
              },
              papeis: ["ADMIN"],
              permissoes: ["tenant.usuario.listar"],
            },
          };
        },
      },
    });

    const resultado = await usecase({
      sessao: {
        usuarioId: "user-1",
        locatarioId: "loc-1",
        sessionId: "sess-1",
        expiraEm: new Date("2026-03-12T12:00:00.000Z"),
      },
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.usuarioId).toBe("user-1");
    expect(resultado.value.papeis).toEqual(["ADMIN"]);
    expect(resultado.value.permissoes).toEqual(["tenant.usuario.listar"]);
  });
});