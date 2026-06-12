// packages/core/src/fornecedores/usecases/excluirFornecedor.ts

import type { FornecedoresRepositorio } from "../portasRepositorio";
import type { ExcluirFornecedorInput, ExcluirFornecedorOutput, ExcluirFornecedorResult } from "../tipos";
import { validarFornecedorId, validarLocatarioId } from "../validadores";
import { fornecedorNaoEncontrado } from "../erros";
import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";

export function createFnExcluirFornecedor(deps: {
  fornecedoresRepositorio: FornecedoresRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  return async function excluirFornecedor(input: ExcluirFornecedorInput): ExcluirFornecedorResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const fornecedorId = validarFornecedorId(input.fornecedorId);
    if (!fornecedorId.ok) return fornecedorId;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.fornecedoresRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
        fornecedorId: fornecedorId.value,
      });
      if (!atual.ok) return atual;
      if (!atual.value) return fornecedorNaoEncontrado(fornecedorId.value);

      const agora = deps.relogio.agora();

      const atualizado = await deps.fornecedoresRepositorio.atualizar({
        ...atual.value,
        excluidoEm: agora,
        excluidoPor: input.excluidoPor ?? null,
        excluidoMotivo: input.excluidoMotivo?.trim() || null,
        atualizadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<ExcluirFornecedorOutput>({
        fornecedor: atualizado.value,
      });
    });
  };
}