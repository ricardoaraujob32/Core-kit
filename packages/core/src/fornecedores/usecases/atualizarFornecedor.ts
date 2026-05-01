import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import type { FornecedoresRepositorio } from "../portasRepositorio";
import type { AtualizarFornecedorInput, AtualizarFornecedorOutput, AtualizarFornecedorResult } from "../tipos";
import { fornecedorNaoEncontrado } from "../erros";
import { validarFornecedorId, validarEmailOpcional, validarLocatarioId, validarNomeFornecedor, validarTextoOpcional } from "../validadores";

export function createFnAtualizarFornecedor(deps: { fornecedoresRepositorio: FornecedoresRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function atualizarFornecedor(input: AtualizarFornecedorInput): AtualizarFornecedorResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const fornecedorId = validarFornecedorId(input.fornecedorId); if (!fornecedorId.ok) return fornecedorId;
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.fornecedoresRepositorio.buscarPorId({ locatarioId: locatarioId.value, fornecedorId: fornecedorId.value });
      if (!atual.ok) return atual;
      if (!atual.value) return fornecedorNaoEncontrado(fornecedorId.value);
      const nome = input.nome === undefined ? null : validarNomeFornecedor(input.nome); if (nome && !nome.ok) return nome;
      const documento = input.documento === undefined ? null : validarTextoOpcional(input.documento); if (documento && !documento.ok) return documento;
      const email = input.email === undefined ? null : validarEmailOpcional(input.email); if (email && !email.ok) return email;
      const telefone = input.telefone === undefined ? null : validarTextoOpcional(input.telefone); if (telefone && !telefone.ok) return telefone;
      const atualizado = await deps.fornecedoresRepositorio.atualizar({ ...atual.value, nome: nome ? nome.value : atual.value.nome, documento: documento ? documento.value : atual.value.documento, email: email ? email.value : atual.value.email, telefone: telefone ? telefone.value : atual.value.telefone, atualizadoEm: deps.relogio.agora() });
      if (!atualizado.ok) return atualizado;
      return wrapOk<AtualizarFornecedorOutput>({ fornecedor: atualizado.value });
    });
  };
}
