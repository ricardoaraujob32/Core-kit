// packages/core/src/fornecedores/usecases/obterFornecedor.ts

import { wrapOk } from "../../kernel";
import type { FornecedoresRepositorio } from "../portasRepositorio";
import type { ObterFornecedorInput, ObterFornecedorOutput, ObterFornecedorResult } from "../tipos";
import { fornecedorNaoEncontrado } from "../erros";
import { validarFornecedorId, validarLocatarioId } from "../validadores";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnObterFornecedor(deps: { fornecedoresRepositorio: FornecedoresRepositorio }) {
  /**
   * 
   */
  return async function obterFornecedor(input: ObterFornecedorInput): ObterFornecedorResult {
    const locatarioId = validarLocatarioId(input.locatarioId); 
    if (!locatarioId.ok) return locatarioId;

    const fornecedorId = validarFornecedorId(input.fornecedorId); 
    if (!fornecedorId.ok) return fornecedorId;

    const res = await deps.fornecedoresRepositorio.buscarPorId({ 
      locatarioId: locatarioId.value, 
      fornecedorId: fornecedorId.value 
    });
    if (!res.ok) return res;
    if (!res.value) return fornecedorNaoEncontrado(fornecedorId.value);
    
    return wrapOk<ObterFornecedorOutput>({ fornecedor: res.value });
  };
}
