// packages/core/__tests__/usuarios/fake/politicaSegurancaUsuariosFake.ts

import { createErroApp, wrapOk } from "../../../src/kernel";
import type { EntradaPoliticaUsuario, PoliticaSegurancaUsuariosPorta } from "../../../src/usuarios/politicas";

/**
 * 
 * @param params 
 * @returns 
 */
export function criarPoliticaSegurancaUsuariosFake(params?: { autorizado?: boolean }) {
  const chamadas: EntradaPoliticaUsuario[] = [];

  const politicaSeguranca: PoliticaSegurancaUsuariosPorta = {
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
            usuarioId: input.usuarioId,
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