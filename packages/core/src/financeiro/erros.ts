// packages/core/src/financeiro/erros.ts

import { createErroApp, type ErroApp, type Result } from "../kernel/index.js";

export type CodigoErroFinanceiro = "FINANCEIRO_INVALIDO";

export function erroFinanceiroInvalido(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp({
    codigo: "INVALIDO",
    mensagem: "Dados financeiros inválidos.",
    detalhes: {
      operacao: "financeiro.validacao",
      ...detalhes,
    },
  });
}
