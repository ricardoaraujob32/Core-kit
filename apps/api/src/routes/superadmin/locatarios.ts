import type { FastifyInstance } from "fastify";
import { wrapSuperAdminRoute } from "../../http/wrapSuperAdminRoute";

export async function registrarRotasSuperAdminLocatarios(
  app: FastifyInstance,
  deps: {
    usecases: {
      criarLocatario: (input: { nome: string }) => Promise<any>;
      listarLocatarios: () => Promise<any>;
      obterLocatario: (input: { locatarioId: string }) => Promise<any>;
    };
  }
) {
  app.post(
    "/superadmin/locatarios",
    wrapSuperAdminRoute(async ({ req }) => {
      const body = (req.body ?? {}) as { nome?: string };

      return deps.usecases.criarLocatario({
        nome: body.nome ?? "",
      });
    })
  );

  app.get(
    "/superadmin/locatarios",
    wrapSuperAdminRoute(async () => {
      return deps.usecases.listarLocatarios();
    })
  );

  app.get(
    "/superadmin/locatarios/:locatarioId",
    wrapSuperAdminRoute(async ({ req }) => {
      const params = req.params as { locatarioId: string };

      return deps.usecases.obterLocatario({
        locatarioId: params.locatarioId,
      });
    })
  );
}