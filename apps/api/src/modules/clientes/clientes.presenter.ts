// apps/api/src/modules/clientes/clientes.presenter.ts

import type { Cliente } from "@core-kit/core";

export function toClienteResponseDto(cliente: Cliente) {
  return {
    clienteId: cliente.clienteId,
    locatarioId: cliente.locatarioId,
    nome: cliente.nome,
    documento: cliente.documento,
    email: cliente.email,
    telefone: cliente.telefone,
    criadoEm: cliente.criadoEm,
    atualizadoEm: cliente.atualizadoEm,
    excluidoEm: cliente.excluidoEm,
  };
}

export function toListarClientesResponseDto(itens: Cliente[]) {
  return itens.map(toClienteResponseDto);
}