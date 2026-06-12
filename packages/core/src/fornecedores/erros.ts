import { createErroApp } from "../kernel/index.js";
import type { FornecedorId } from "./tipos.js";

export function fornecedorNaoEncontrado(fornecedorId: FornecedorId) {
  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Fornecedor não encontrado.", detalhes: { operacao: "fornecedors.naoEncontrado", fornecedorId } });
}

export function fornecedorInativo(fornecedorId: FornecedorId) {
  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Fornecedor inativo não pode ser utilizado.", detalhes: { operacao: "fornecedors.inativo", fornecedorId } });
}
