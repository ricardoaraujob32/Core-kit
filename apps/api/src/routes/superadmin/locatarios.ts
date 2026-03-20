// apps/api/src/routes/superadmin/locatarios.ts

import type { FastifyInstance } from "fastify";

type Resultado<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      error: {
        codigo: string;
        mensagem: string;
        detalhes?: Record<string, unknown>;
      };
    };

type LocatarioResumo = {
  locatarioId: string;
  nome: string;
};

export async function registrarRotasSuperAdminLocatarios(
  app: FastifyInstance,
  deps: {
    wrapSuperAdminRoute: <TBody = unknown, TResult = unknown>(
      handler: (args: {
        req: any;
        reply: any;
        ctx: any;
      }) => Promise<Resultado<TResult>> | Resultado<TResult>,
    ) => (req: any, reply: any) => Promise<unknown>;
    usecases: {
      criarLocatario: (input: { nome: string }) => Promise<Resultado<LocatarioResumo>>;
      listarLocatarios: () => Promise<Resultado<{ items: LocatarioResumo[] }>>;
      obterLocatario: (input: { locatarioId: string }) => Promise<Resultado<LocatarioResumo>>;
    };
  },
) {
  app.post(
    "/superadmin/locatarios",
    deps.wrapSuperAdminRoute(async ({ req }) => {
      const body = (req.body ?? {}) as { nome?: string };
      return deps.usecases.criarLocatario({ nome: body.nome ?? "" });
    }),
  );

  app.get(
    "/superadmin/locatarios",
    deps.wrapSuperAdminRoute(async () => deps.usecases.listarLocatarios()),
  );

  app.get(
    "/superadmin/locatarios/:locatarioId",
    deps.wrapSuperAdminRoute(async ({ req }) => {
      const params = req.params as { locatarioId: string };
      return deps.usecases.obterLocatario({ locatarioId: params.locatarioId });
    }),
  );
}