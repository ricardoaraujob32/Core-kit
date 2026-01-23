import type { FastifyInstance } from "fastify";
import { ok } from "@core-kit/core";
import { wrapRoute } from "../http/wrapRoute";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/health",
    wrapRoute(async () =>
      ok({ ok: true, service: "api", time: new Date().toISOString() }),
    ),
  );
}
