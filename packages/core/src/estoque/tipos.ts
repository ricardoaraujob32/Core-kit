// packages/core/src/estoque/tipos.ts

import { LocatarioId } from "../locatario";
import { UsuarioId } from "../usuarios";

/**
 * 
 */
export type TipoItem = "PRODUTO" | "SERVICO";

/**
 * 
 */
export type TipoMovimentoEstoque = "ENTRADA" | "SAIDA" | "AJUSTE";

/**
 * 
 */
export type ItemId = string;

/**
 * 
 */
export type Item = {
  id: ItemId;
  tipoItem: TipoItem;
  nome: string;
  unidade: string;
  sku?: string | null;
  ativo: boolean;
  excluidoEm?: Date;
  atualizadoEm: Date;
};

/**
 * 
 */
export type NovoItem = {
  tipoItem: TipoItem;
  nome: string;
  unidade: string;
  sku?: string | null;
};

/**
 * 
 */
export type EstoqueId = string;

/**
 * 
 */
export type Estoque = {
  id: EstoqueId;
  locatarioId: LocatarioId;
  nome: string;
  padrao: boolean;
  criadoEm: Date;
};

/**
 * 
 */
export type MovimentoEstoqueId = string;

/**
 * 
 */
export type MovimentoEstoque = {
  id: MovimentoEstoqueId;
  locatarioId: LocatarioId;
  estoqueId: EstoqueId;
  itemId: ItemId;
  tipo: TipoMovimentoEstoque;
  quantidade: number; // sempre positiva; o "sinal" vem do tipo
  motivo?: string;
  usuarioId: UsuarioId; // (opção A) não aceitar null: sempre usuário/ator
  criadoEm: Date;
};

/**
 * 
 */
export type NovoMovimentoEstoque = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  estoqueId?: EstoqueId | null;
  itemId: ItemId;
  tipo: TipoMovimentoEstoque;
  delta: number;
  referencia?: string | null;
  observacao?: string | null;
  criadoEm: Date;
};

/**
 * 
 */
export type SaldoEstoque = {
  quantidade: number;
};
