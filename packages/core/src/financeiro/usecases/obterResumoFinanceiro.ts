// packages/core/src/financeiro/usecases/obterResumoFinanceiro.ts

import { wrapOk } from "../../kernel/index.js";
import type { FinanceiroTransacoesConsultaRepositorio } from "../portasRepositorio.js";
import type { ObterResumoFinanceiroInput, ObterResumoFinanceiroResult } from "../tipos.js";
import { validarObterResumoFinanceiroInput } from "../validadores.js";

type Deps = {
  financeiroRepositorio: FinanceiroTransacoesConsultaRepositorio;
};

export function createFnObterResumoFinanceiro(deps: Deps) {
  return async function obterResumoFinanceiro(input: ObterResumoFinanceiroInput): ObterResumoFinanceiroResult {
    const validado = validarObterResumoFinanceiroInput(input);
    if (!validado.ok) return validado;

    const resumo = await deps.financeiroRepositorio.obterResumoFinanceiro(validado.value);
    if (!resumo.ok) return resumo;

    return wrapOk({ resumo: resumo.value });
  };
}
