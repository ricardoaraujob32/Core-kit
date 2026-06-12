// packages/core/src/kernel/errosInfra.ts

import { wrapErr } from "../../src/kernel/result";

export function erroSimulado(detalhes?: Record<string, unknown>) {
  return wrapErr({
    codigo: "ERRO_REPOSITORIO",
    mensagem: "Falha simulada",
    detalhes: {
      simulada: true,
      ...detalhes,
    },
  });
}