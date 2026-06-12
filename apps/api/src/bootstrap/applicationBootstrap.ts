// apps/api/src/bootstrap/applicationBootstrap.ts

import type { FastifyInstance } from "fastify";
import { createAuthorizationBootstrap } from "./authorizationBootstrap.js";
import { createAuthBootstrap } from "./authBootstrap.js";

export type ApplicationBootstrap = {
  auth: ReturnType<typeof createAuthBootstrap>;
  authorization: ReturnType<typeof createAuthorizationBootstrap>;
};

declare module "fastify" {
  interface FastifyInstance {
    applicationBootstrap: ApplicationBootstrap;
  }
}

export async function runApplicationBootstrap(app: FastifyInstance): Promise<ApplicationBootstrap> {
  const auth = createAuthBootstrap();
  const authorization = createAuthorizationBootstrap();

  await authorization.warmup();

  const bootstrap: ApplicationBootstrap = {
    auth,
    authorization,
  };

  app.decorate("applicationBootstrap", bootstrap);

  return bootstrap;
}