import { createErroApp } from "../kernel";
import type { FornecedorId } from "./tipos";

export function fornecedorNaoEncontrado(fornecedorId: FornecedorId) {
  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Fornecedor não encontrado.", detalhes: { operacao: "fornecedors.naoEncontrado", fornecedorId } });
}

export function fornecedorInativo(fornecedorId: FornecedorId) {
  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Fornecedor inativo não pode ser utilizado.", detalhes: { operacao: "fornecedors.inativo", fornecedorId } });
}
