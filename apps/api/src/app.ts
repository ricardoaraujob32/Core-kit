// apps/api/src/app.ts

import Fastify from "fastify";
import cors from "@fastify/cors";
import { authPlugin } from "./plugins/auth";
import { requestIdPlugin } from "./middlewares/requestId";
import { routes } from "./routes";
import { runApplicationBootstrap } from "./bootstrap/applicationBootstrap";
import { initDb } from "./infra/prisma/initDb";

/**
 * Cria e prepara a aplicação Fastify.
 *
 * Ciclo de vida:
 * 1. instancia Fastify;
 * 2. registra plugins básicos de infraestrutura;
 * 3. inicializa subsistemas transversais (bootstrap);
 * 4. registra rotas HTTP;
 * 5. devolve a aplicação pronta para `listen()`.
 */
export async function criarApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

  await app.register(requestIdPlugin);
  await app.register(authPlugin);
  await initDb();
  await runApplicationBootstrap(app);
  await app.register(routes, { prefix: "" });

  return app;
}
