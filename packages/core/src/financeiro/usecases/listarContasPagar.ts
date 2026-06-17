// packages/core/src/financeiro/usecases/listarContasPagar.ts

import { wrapOk } from "../../kernel/index.js";
import type { FinanceiroTransacoesConsultaRepositorio } from "../portasRepositorio.js";
import type { ListarContasFinanceirasInput, ListarContasFinanceirasResult } from "../tipos.js";
import { validarListarContasFinanceirasInput } from "../validadores.js";

type Deps = {
  financeiroRepositorio: FinanceiroTransacoesConsultaRepositorio;
};

export function createFnListarContasPagar(deps: Deps) {
  return async function listarContasPagar(input: ListarContasFinanceirasInput): ListarContasFinanceirasResult {
    const validado = validarListarContasFinanceirasInput(input);
    if (!validado.ok) return validado;

    const itens = await deps.financeiroRepositorio.listarContasPagar(validado.value);
    if (!itens.ok) return itens;

    return wrapOk({ itens: itens.value });
  };
}
