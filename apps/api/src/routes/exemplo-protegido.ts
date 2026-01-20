import type { FastifyInstance } from "fastify";
import { exigirPermissao, type ContextoExecucao } from "@core-kit/core";
import { mapAppErrorToHttpStatus, toHttpErrorBody } from "../http/errors";

declare module "fastify" {
  interface FastifyRequest {
    ctx: ContextoExecucao;
  }
}

export async function registerExemploProtegidoRoutes(app: FastifyInstance): Promise<void> {
  /**
   * Endpoint de exemplo:
   * Exige permissão "usuarios:listar"
   */
  app.get("/exemplo/protegido", async (req, reply) => {
    const r = exigirPermissao(req.ctx, "usuarios:listar");

    if (!r.ok) {
      const status: number = mapAppErrorToHttpStatus(r.error);
      return reply.status(status).send(toHttpErrorBody(r.error));
    }

    return { ok: true, data: ["alice", "bob"] };
  });
}
