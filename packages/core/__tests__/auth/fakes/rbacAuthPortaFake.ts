// packages/core/__tests__/auth/fakes/rbacAuthPortaFake.ts

import { createErroApp, wrapOk, type ContextoExecucao } from "../../../src/kernel";
import type { RbacAuthPorta } from "../../../src/auth/portasServico";

/**
 * 
 * @param params 
 * @returns 
 */
export function criarRbacAuthPortaFake(params: { falhar?: boolean } = {}) {
  let chamadas = 0;

  const porta: RbacAuthPorta = {
    async resolverPermissoes(ctx: ContextoExecucao) {
      chamadas++;

      if (params.falhar) {
        return createErroApp({
          codigo: "ERRO_INTERNO",
          mensagem: "",
          detalhes: { simulada: true },
        });
      }

      return wrapOk(ctx);
    },
  };

  return {
    porta,
    chamadas: () => chamadas,
  };
}