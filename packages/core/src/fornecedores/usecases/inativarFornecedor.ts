import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import type { FornecedoresRepositorio } from "../portasRepositorio";
import type { InativarFornecedorInput, InativarFornecedorOutput, InativarFornecedorResult } from "../tipos";
import { fornecedorNaoEncontrado } from "../erros";
import { validarFornecedorId, validarLocatarioId } from "../validadores";

export function createFnInativarFornecedor(deps: { fornecedorsRepositorio: FornecedoresRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function inativarFornecedor(input: InativarFornecedorInput): InativarFornecedorResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const fornecedorId = validarFornecedorId(input.fornecedorId); if (!fornecedorId.ok) return fornecedorId;
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.fornecedorsRepositorio.buscarPorId({ locatarioId: locatarioId.value, fornecedorId: fornecedorId.value });
      if (!atual.ok) return atual;
      if (!atual.value) return fornecedorNaoEncontrado(fornecedorId.value);
      const atualizado = await deps.fornecedorsRepositorio.atualizar({ ...atual.value, status: "INATIVO", atualizadoEm: deps.relogio.agora() });
      if (!atualizado.ok) return atualizado;
      return wrapOk<InativarFornecedorOutput>({ fornecedor: atualizado.value });
    });
  };
}
