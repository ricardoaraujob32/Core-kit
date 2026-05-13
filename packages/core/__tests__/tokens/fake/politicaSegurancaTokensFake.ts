// packages/core/__tests__/tokens/fake/politicaSegurancaTokensFake.ts

import { createErroApp, wrapOk } from "../../../src/kernel";
import type { EntradaPoliticaToken, PoliticaSegurancaTokensPorta } from "../../../src/tokens/politicas";

export function criarPoliticaSegurancaTokensFake(params?: {
  autorizado?: boolean;
}) {
  const chamadas: EntradaPoliticaToken[] = [];

  const politicaSeguranca: PoliticaSegurancaTokensPorta = {
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
            tokenId: input.tokenId,
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