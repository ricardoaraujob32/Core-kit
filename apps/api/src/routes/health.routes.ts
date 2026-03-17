import type { FastifyInstance } from "fastify";

export async function registrarRotaHealth(app: FastifyInstance) {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "core-kit-api",
    };
  });
}