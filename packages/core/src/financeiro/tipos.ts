// packages/core/src/financeiro/tipos.ts
// Finalidade: Tipos do domínio Financeiro leve (somente tipos).

import type { LocatarioId } from "../locatario";
import type { UsuarioId } from "../usuarios/tipos";

export type LancamentoFinanceiroId = string;

export type TipoLancamentoFinanceiro = "RECEITA" | "DESPESA";

export type StatusLancamentoFinanceiro = "ABERTO" | "QUITADO" | "CANCELADO";

export type OrigemLancamentoFinanceiro =
  | { tipo: "MANUAL" }
  | { tipo: "TRANSACAO"; id: string; natureza: "COMPRA" | "VENDA" }
  | { tipo: "ORDEM_SERVICO"; id: string };

export type LancamentoFinanceiro = {
  id: LancamentoFinanceiroId;
  locatarioId: LocatarioId;
  tipo: TipoLancamentoFinanceiro;
  status: StatusLancamentoFinanceiro;

  valorCentavos: number;
  descricao: string;

  origem: OrigemLancamentoFinanceiro;

  vencimentoEm?: Date;

  criadoEm: Date;
  criadoPor: UsuarioId;

  quitadoEm?: Date;
  quitadoPor?: UsuarioId;
};
