// packages/core/__tests__/auditoria/fake/politicaSegurancaAuditoriaFake.ts

import { createErroApp, wrapOk } from "../../../src/kernel";
import type {
  EntradaPoliticaAuditoria,
  PoliticaSegurancaAuditoriaPorta,
} from "../../../src/auditoria/politicas";

export function criarPoliticaSegurancaAuditoriaFake(params: {
  falhar?: boolean;
} = {}) {
  let chamadas = 0;
  let ultimaEntrada: EntradaPoliticaAuditoria | null = null;

  const politica: PoliticaSegurancaAuditoriaPorta = {
    async autorizar(input) {
      chamadas++;
      ultimaEntrada = input;

      if (params.falhar) {
        return createErroApp({
          codigo: "AUDITORIA_NAO_AUTORIZADA",
          mensagem: ""
,          detalhes: { simulada: true },
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