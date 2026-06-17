// packages/core/src/financeiro/usecases/listarContasReceber.ts

import { wrapOk } from "../../kernel/index.js";
import type { FinanceiroTransacoesConsultaRepositorio } from "../portasRepositorio.js";
import type { ListarContasFinanceirasInput, ListarContasFinanceirasResult } from "../tipos.js";
import { validarListarContasFinanceirasInput } from "../validadores.js";

type Deps = {
  financeiroRepositorio: FinanceiroTransacoesConsultaRepositorio;
};

export function createFnListarContasReceber(deps: Deps) {
  return async function listarContasReceber(input: ListarContasFinanceirasInput): ListarContasFinanceirasResult {
    const validado = validarListarContasFinanceirasInput(input);
    if (!validado.ok) return validado;

    const itens = await deps.financeiroRepositorio.listarContasReceber(validado.value);
    if (!itens.ok) return itens;

    return wrapOk({ itens: itens.value });
  };
}
