import type { FastifyInstance } from "fastify";
import { ok } from "@core-kit/core";
import { wrapRoute } from "../http/wrapRoute";
import { exigirPermissao } from "../http/autorizacao";

export async function registerExemploProtegidoRoutes(app: FastifyInstance): Promise<void> {
  /**
   * Endpoint de exemplo:
   * Exige permissão "usuarios:listar"
   */
  app.get(
    "/exemplo/protegido",
    wrapRoute(async (ctx) => {
      const r = exigirPermissao(ctx, "usuarios:listar");
      if (!r.ok) return r;

      return ok({ ok: true, data: ["alice", "bob"] });
    }),
  );
}
