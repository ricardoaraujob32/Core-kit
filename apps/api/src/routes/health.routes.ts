// apps/api/src/routes/health.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { clientePrisma } from "../infra/prisma/client.js";

function versionInfo() {
  return {
    service: "core-kit-api",
    version: process.env.npm_package_version ?? "0.1.0",
    commit: process.env.RENDER_GIT_COMMIT ?? process.env.GIT_COMMIT ?? "local",
    env: process.env.NODE_ENV ?? "development",
  };
}

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "core-kit-api",
    };
  });

  app.get("/version", async () => {
    return versionInfo();
  });

  app.get("/ready", async (_request, reply) => {
    try {
      await clientePrisma.$queryRaw`SELECT 1`;

      return {
        status: "ready",
        database: "ok",
        ...versionInfo(),
      };
    } catch {
      return reply.status(503).send({
        status: "not_ready",
        database: "error",
        ...versionInfo(),
      });
    }
  });
};