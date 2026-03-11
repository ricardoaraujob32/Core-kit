import type { FastifyInstance } from "fastify";
import { wrapRoute } from "../http/wrapRoute";

export async function registrarRotasAuth(
  app: FastifyInstance,
  deps: {
    usecases: {
      emitirSessao: (input: {
        locatarioId: string;
        email: string;
        senha: string;
      }) => Promise<any>;
      validarSessao: (input: { token: string }) => any;
      resolverContextoAutorizado: (input: { sessao: any }) => Promise<any>;
      rotacionarRefresh: (input: {
        locatarioId: string;
        refreshToken: string;
      }) => Promise<any>;
    };
  }
) {
  app.post(
    "/auth/login",
    wrapRoute(async ({ req }) => {
      const body = (req.body ?? {}) as {
        locatarioId?: string;
        email?: string;
        senha?: string;
      };

      return deps.usecases.emitirSessao({
        locatarioId: body.locatarioId ?? "",
        email: body.email ?? "",
        senha: body.senha ?? "",
      });
    })
  );

  app.post(
    "/auth/refresh",
    wrapRoute(async ({ req }) => {
      const body = (req.body ?? {}) as {
        locatarioId?: string;
        refreshToken?: string;
      };

      return deps.usecases.rotacionarRefresh({
        locatarioId: body.locatarioId ?? "",
        refreshToken: body.refreshToken ?? "",
      });
    })
  );

  app.get(
    "/auth/session",
    wrapRoute(async ({ req }) => {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : "";

      const sessaoRes = deps.usecases.validarSessao({ token });
      if (!sessaoRes.ok) return sessaoRes;

      return deps.usecases.resolverContextoAutorizado({
        sessao: sessaoRes.value,
      });
    })
  );
}