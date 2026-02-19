// packages/core/src/ordensServico/tipos.ts
// Finalidade: Tipos do domínio de Ordens de Serviço (somente tipos).

import type { LocatarioId } from "../locatario";
import type { UsuarioId } from "../usuarios/tipos";
import type { ItemCatalogoId } from "../estoque/tipos";

export type OrdemServicoId = string;

export type StatusOrdemServico = "ABERTA" | "EM_EXECUCAO" | "CONCLUIDA" | "CANCELADA";

export type ItemServicoId = string;

export type ItemServico = {
  id: ItemServicoId;
  descricao: string;
};

export type ProdutoConsumidoId = string;

export type ProdutoConsumido = {
  id: ProdutoConsumidoId;
  itemId: ItemCatalogoId;
  quantidade: number;
  motivo?: string;
};

export type OrdemServico = {
  id: OrdemServicoId;
  locatarioId: LocatarioId;
  titulo: string;
  status: StatusOrdemServico;

  itensServico: ItemServico[];
  produtosConsumidos: ProdutoConsumido[];

  usuarioId: UsuarioId;
  criadaEm: Date;
  atualizadaEm: Date;
};
