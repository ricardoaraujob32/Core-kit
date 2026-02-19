// packages/core/src/transacoes/tipos.ts
// Finalidade: Tipos do domínio de Transações (somente tipos).

import type { LocatarioId } from "../locatario";
import type { UsuarioId } from "../usuarios/tipos";
import type { ItemCatalogoId } from "../estoque/tipos";

export type TransacaoId = string;

export type TipoTransacao = "COMPRA" | "VENDA";

export type StatusTransacao = "CONFIRMADA" | "CANCELADA";

export type ItemTransacao = {
  itemId: ItemCatalogoId;
  quantidade: number; // inteiro positivo
};

export type Transacao = {
  id: TransacaoId;
  locatarioId: LocatarioId;
  tipo: TipoTransacao;
  status: StatusTransacao;
  itens: ItemTransacao[];
  observacao?: string;
  usuarioId: UsuarioId; // (opção A) sempre presente
  criadaEm: Date;
};
