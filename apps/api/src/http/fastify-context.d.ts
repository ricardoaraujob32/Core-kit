// apps/api/src/http/fastify-context.d.ts

import "fastify";
import type { ContextoExecucao } from "@core-kit/core";

declare module "fastify" {
  interface FastifyRequest {
    ctx: ContextoExecucao;
  }
}
