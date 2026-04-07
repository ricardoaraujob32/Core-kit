// apps/api/src/bootstrap/applicationBootstrap.ts

import type { FastifyInstance } from "fastify";
import { createAuthorizationBootstrap } from "./authorizationBootstrap";

export type ApplicationBootstrap = {
  authorization: ReturnType<typeof createAuthorizationBootstrap>;
};

/**
 * Decoration do Fastify para acesso ao bootstrap da aplicação.
 */
declare module "fastify" {
  interface FastifyInstance {
    applicationBootstrap: ApplicationBootstrap;
  }
}

/**
 * Executa o bootstrap transversal da aplicação.
 *
 * Ordem atual:
 * - autorização
 *
 * Observação:
 * - novos bootstraps podem ser adicionados aqui sem poluir `app.ts`.
 */
export async function runApplicationBootstrap(app: FastifyInstance): Promise<ApplicationBootstrap> {
  const authorization = createAuthorizationBootstrap();

  await authorization.warmup();

  const bootstrap: ApplicationBootstrap = {
    authorization,
  };

  app.decorate("applicationBootstrap", bootstrap);

  return bootstrap;
}
