import type { FastifyInstance } from "fastify";
import { wrapRoute } from "../http/wrapRoute";

export async function registrarRotasUsuarios(
  app: FastifyInstance,
  deps: {
    usecases: {
      criarUsuario: (input: {
        locatarioId: string;
        email: string;
        senhaHash: string;
        status?: "ATIVO" | "INATIVO" | "BLOQUEADO";
      }) => Promise<any>;

      listarUsuarios: (input: {
        locatarioId: string;
        limite?: number;
        cursor?: string;
      }) => Promise<any>;
      
      obterUsuario: (input: {
        locatarioId: string;
        usuarioId: string;
      }) => Promise<any>;
    };
  }
) {
  app.post(
    "/usuarios",
    wrapRoute(async ({ req, ctx }) => {
      const body = (req.body ?? {}) as {
        email?: string;
        senhaHash?: string;
        status?: "ATIVO" | "INATIVO" | "BLOQUEADO";
      };

      return deps.usecases.criarUsuario({
        locatarioId: (ctx as any).locatarioId,
        email: body.email ?? "",
        senhaHash: body.senhaHash ?? "",
        status: body.status,
      });
    })
  );

  app.get(
    "/usuarios",
    wrapRoute(async ({ req, ctx }) => {
      const query = (req.query ?? {}) as {
        limite?: string;
        cursor?: string;
      };

      return deps.usecases.listarUsuarios({
        locatarioId: (ctx as any).locatarioId,
        limite: query.limite ? Number(query.limite) : undefined,
        cursor: query.cursor,
      });
    })
  );

  app.get(
    "/usuarios/:usuarioId",
    wrapRoute(async ({ req, ctx }) => {
      const params = req.params as { usuarioId: string };

      return deps.usecases.obterUsuario({
        locatarioId: (ctx as any).locatarioId,
        usuarioId: params.usuarioId,
      });
    })
  );

  app.get(
  "/estoque/ping",
  wrapRoute(
    { modulo: "ESTOQUE" },
    async ({ ctx }) => ({
      ok: true,
      value: {
        status: "ok",
        modulo: "ESTOQUE",
        locatarioId: ctx.locatarioId,
        modulosHabilitados: ctx.modulosHabilitados ?? [],
      },
    }),
  ),
);
}