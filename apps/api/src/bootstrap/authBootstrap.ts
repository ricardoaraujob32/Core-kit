// apps/api/src/bootstrap/authBootstrap.ts

import { clientePrisma } from "../infra/prisma/client";
import { createAuthHttpRuntime, type CreateAuthDepsParams } from "../infra/prisma/auth/authHttpRuntime";
import { createEventosSegurancaPorta } from "../infra/prisma/auth/eventosSegurancaPorta";

export type AuthBootstrap = {
  runtime: ReturnType<typeof createAuthHttpRuntime>;
};

let authBootstrapInstance: AuthBootstrap | null = null;

/**
 * Bootstrap oficial de autenticação.
 *
 * Responsabilidades:
 * - compor runtime oficial de auth;
 * - injetar EventosSegurancaPorta;
 * - impedir composição paralela em controllers/guards.
 */
export function createAuthBootstrap(params: CreateAuthDepsParams = {}): AuthBootstrap {
  const eventos = params.eventos ?? createEventosSegurancaPorta(clientePrisma);

  const runtime = createAuthHttpRuntime(
    {
      ...params,
      eventos,
    },
    clientePrisma,
  );

  const bootstrap: AuthBootstrap = {
    runtime,
  };

  authBootstrapInstance = bootstrap;
  return bootstrap;
}

export function getAuthBootstrap(): AuthBootstrap {
  if (!authBootstrapInstance) {
    throw new Error("Auth bootstrap ainda não foi inicializado. Execute o application bootstrap antes de usar auth.");
  }

  return authBootstrapInstance;
}