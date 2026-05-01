// apps/api/src/modules/produtos/produtos.presenter.ts

import type { Produto } from "@core-kit/core";

export function toProdutoResponseDto(produto: Produto) {
  return {
    produtoId: produto.produtoId,
    locatarioId: produto.locatarioId,
    sku: produto.sku,
    nome: produto.nome,
    descricao: produto.descricao,
    unidade: produto.unidade,
    tipo: produto.tipo,
    precoVenda: produto.precoVenda,
    custoReferencia: produto.custoReferencia,
    ativo: produto.ativo,
    criadoEm: produto.criadoEm,
    atualizadoEm: produto.atualizadoEm,
    excluidoEm: produto.excluidoEm,
  };
}

export function toListarProdutosResponseDto(itens: Produto[]) {
  return itens.map(toProdutoResponseDto);
}