import Fastify from "fastify";
import cors from "@fastify/cors";
import { authPlugin } from "./plugins/auth";
import { requestIdPlugin } from "./middlewares/requestId";
import { routes } from "./routes";

export async function criarApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(requestIdPlugin);
  await app.register(authPlugin);
  await app.register(routes, { prefix: "" });

  return app;
}