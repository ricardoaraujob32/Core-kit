import { createErroApp } from "../kernel/index.js";
import type { ProdutoId } from "./tipos.js";

export function produtoNaoEncontrado(produtoId: ProdutoId) {
  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Produto ou serviço não encontrado.", detalhes: { operacao: "produtos.naoEncontrado", produtoId } });
}

export function produtoInativo(produtoId: ProdutoId) {
  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Produto ou serviço inativo não pode ser utilizado.", detalhes: { operacao: "produtos.inativo", produtoId } });
}
