// apps/api/src/middlewares/requestId.ts

import { randomUUID } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";

export const requestIdPlugin: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request) => {
    request.requestIdApp = request.headers["x-request-id"]?.toString() ?? randomUUID();
  });
};