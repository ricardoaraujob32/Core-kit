// packages/core/__tests__/assinaturas/fake/politicaSegurancaAssinaturasFake.ts

import { createErroApp, wrapOk } from "../../../src/kernel";
import type { EntradaPoliticaAssinatura, PoliticaSegurancaAssinaturasPorta } from "../../../src/assinaturas/politicas";

export function criarPoliticaSegurancaAssinaturasFake(params: {
  falhar?: boolean;
} = {}) {
  let chamadas = 0;
  let ultimaEntrada: EntradaPoliticaAssinatura | null = null;

  const politica: PoliticaSegurancaAssinaturasPorta = {
    async autorizar(input) {
      chamadas++;
      ultimaEntrada = input;

      if (params.falhar) {
        return createErroApp({
          codigo: "ASSINATURA_NAO_AUTORIZADA",
          mensagem: "",
          detalhes: { simulada: true },
        });
      }

      return wrapOk(undefined);
    },
  };

  return {
    politica,
    chamadas: () => chamadas,
    ultimaEntrada: () => ultimaEntrada,
  };
}