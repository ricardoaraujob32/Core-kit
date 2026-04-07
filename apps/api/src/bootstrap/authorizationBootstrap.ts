// apps/api/src/bootstrap/authorizationBootstrap.ts

import { clientePrisma } from "../infra/prisma/client";
import { createBootstrapAutorizacaoRepositorio } from "../infra/prisma/autorizacao/bootstrapAutorizacaoRepositorioPrisma";
import { createAutorizacaoHttpRuntime } from "../infra/prisma/autorizacao/autorizacaoHttpRuntime";
import { authorizationCatalogStore, AuthorizationCatalogStore } from "./authorizationCatalogStore";

export type AuthorizationBootstrap = {
  runtime: ReturnType<typeof createAutorizacaoHttpRuntime>;
  catalogStore: AuthorizationCatalogStore;
  warmup(): Promise<void>;
  reloadCatalog(): Promise<void>;
};

let authorizationBootstrapInstance: AuthorizationBootstrap | null = null;

/**
 * Cria o bootstrap da autorização.
 *
 * Responsabilidades:
 * - instanciar o runtime oficial de autorização;
 * - carregar o catálogo global em memória;
 * - oferecer recarga explícita futura.
 */
export function createAuthorizationBootstrap(): AuthorizationBootstrap {
  const runtime = createAutorizacaoHttpRuntime();
  const catalogStore = authorizationCatalogStore;
  const repositorioBootstrap = createBootstrapAutorizacaoRepositorio(clientePrisma);

  /**
   * 
   */
  async function reloadCatalog(): Promise<void> {
    const resultado = await repositorioBootstrap.carregarCatalogo();

    if (!resultado.ok) {
      throw new Error(
        `[authorizationBootstrap] Falha ao carregar catálogo: ${resultado.error.mensagem}`,
      );
    }

    catalogStore.replace(resultado.value);
  }

  /**
   * 
   */
  async function warmup(): Promise<void> {
    await reloadCatalog();
  }

  const bootstrap: AuthorizationBootstrap = {
    runtime,
    catalogStore,
    warmup,
    reloadCatalog,
  };

  authorizationBootstrapInstance = bootstrap;
  return bootstrap;
}

/**
 * 
 * @returns 
 */
export function getAuthorizationBootstrap(): AuthorizationBootstrap {
  if (!authorizationBootstrapInstance) {
    throw new Error(
      "Authorization bootstrap ainda não foi inicializado. Execute o application bootstrap antes de usar o runtime.",
    );
  }

  return authorizationBootstrapInstance;
}
