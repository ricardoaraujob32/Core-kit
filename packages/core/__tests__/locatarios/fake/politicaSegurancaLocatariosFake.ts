// packages/core/__tests__/locatarios/fake/politicaSegurancaLocatariosFake.ts

import { createErroApp, wrapOk } from "../../../src/kernel";
import type { EntradaPoliticaLocatario, PoliticaSegurancaLocatariosPorta } from "../../../src/locatarios/politicas";

/**
 * 
 * @param params 
 * @returns 
 */
export function criarPoliticaSegurancaLocatariosFake(params?: { autorizado?: boolean }) {
  const chamadas: EntradaPoliticaLocatario[] = [];

  const politicaSeguranca: PoliticaSegurancaLocatariosPorta = {
    async autorizar(input) {
      chamadas.push(input);

      if (params?.autorizado === false) {
        return createErroApp({
          codigo: "NAO_AUTORIZADO",
          mensagem: "Operação não autorizada pela política fake.",
          detalhes: {
            simulada: true,
            operacao: input.operacao,
            locatarioId: input.locatarioId,
          },
        });
      }

      return wrapOk(undefined);
    },
  };

  return {
    politicaSeguranca,
    chamadas: () => [...chamadas],
    ultimaChamada: () => chamadas.at(-1) ?? null,
  };
}
