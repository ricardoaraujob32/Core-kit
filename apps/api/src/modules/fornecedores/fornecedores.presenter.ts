// apps/api/src/modules/fornecedores/fornecedores.presenter.ts

import type { Fornecedor } from "@core-kit/core";

export function toFornecedorResponseDto(fornecedor: Fornecedor) {
  return {
    fornecedorId: fornecedor.fornecedorId,
    locatarioId: fornecedor.locatarioId,
    nome: fornecedor.nome,
    documento: fornecedor.documento,
    email: fornecedor.email,
    telefone: fornecedor.telefone,
    criadoEm: fornecedor.criadoEm,
    atualizadoEm: fornecedor.atualizadoEm,
    excluidoEm: fornecedor.excluidoEm,
  };
}

export function toListarFornecedoresResponseDto(itens: Fornecedor[]) {
  return itens.map(toFornecedorResponseDto);
}