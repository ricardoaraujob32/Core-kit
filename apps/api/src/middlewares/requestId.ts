// apps/api/src/middlewares/requestId.ts

import { randomUUID } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";

export const requestIdPlugin: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    const requestId =
      request.headers["x-request-id"]?.toString().trim() || randomUUID();

    request.requestIdApp = requestId;
    reply.header("x-request-id", requestId);
  });
};