// packages/core/src/vendas/validadores.ts

import { createErroApp, wrapOk } from "../kernel/index.js";
import type { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import type { TransacaoId, ItemTransacaoId, TipoTransacaoComercial, StatusTransacaoComercial } from "./tipos.js";

export function validarLocatarioId(v: unknown): Result<LocatarioId, ErroApp> {
  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO" as never, mensagem: "Locatário obrigatório.", detalhes: { operacao: "vendas.validarLocatarioId" } });
  return wrapOk(v.trim() as LocatarioId);
}
export function validarTransacaoId(v: unknown): Result<TransacaoId, ErroApp> {
  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "INVALIDO", mensagem: "Transação inválida.", detalhes: { operacao: "vendas.validarTransacaoId" } });
  return wrapOk(v.trim() as TransacaoId);
}
export function validarItemTransacaoId(v: unknown): Result<ItemTransacaoId, ErroApp> {
  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "INVALIDO", mensagem: "Item inválido.", detalhes: { operacao: "vendas.validarItemTransacaoId" } });
  return wrapOk(v.trim() as ItemTransacaoId);
}
export function validarTipoTransacao(v: unknown): Result<TipoTransacaoComercial, ErroApp> {
  if (v !== "VENDA" && v !== "COMPRA") return createErroApp({ codigo: "INVALIDO", mensagem: "Tipo de transação inválido.", detalhes: { operacao: "vendas.validarTipoTransacao" } });
  return wrapOk(v);
}
export function validarStatusTransacao(v: unknown): Result<StatusTransacaoComercial, ErroApp> {
  if (!["RASCUNHO", "ABERTA", "CONFIRMADA", "CONCLUIDA", "CANCELADA"].includes(String(v))) return createErroApp({ codigo: "INVALIDO", mensagem: "Status de transação inválido.", detalhes: { operacao: "vendas.validarStatusTransacao" } });
  return wrapOk(v as StatusTransacaoComercial);
}
export function validarQuantidade(v: unknown): Result<number, ErroApp> {
  if (typeof v !== "number" || Number.isNaN(v) || v <= 0) return createErroApp({ codigo: "INVALIDO", mensagem: "Quantidade deve ser maior que zero.", detalhes: { operacao: "vendas.validarQuantidade" } });
  return wrapOk(v);
}
export function validarValorNaoNegativo(v: unknown, campo: string): Result<number, ErroApp> {
  if (v === undefined || v === null) return wrapOk(0);
  if (typeof v !== "number" || Number.isNaN(v) || v < 0) return createErroApp({ codigo: "INVALIDO", mensagem: `${campo} deve ser maior ou igual a zero.`, detalhes: { operacao: "vendas.validarValor", campo } });
  return wrapOk(v);
}
export function validarTextoOpcional(v: unknown): Result<string | null, ErroApp> {
  if (v === undefined || v === null || v === "") return wrapOk(null);
  if (typeof v !== "string") return createErroApp({ codigo: "INVALIDO", mensagem: "Texto inválido.", detalhes: { operacao: "vendas.validarTextoOpcional" } });
  return wrapOk(v.trim() || null);
}

export function validarQuantidadeItem(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Quantidade deve ser maior que zero.",
    });
  }

  return wrapOk(value);
}

export function validarValorUnitario(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Valor unitário deve ser maior ou igual a zero.",
    });
  }

  return wrapOk(value);
}

export function validarValorDesconto(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Valor de desconto deve ser maior ou igual a zero.",
    });
  }

  return wrapOk(value);
}
