// packages/core/src/produtos/validadores.ts

import { createErroApp, wrapOk } from "../kernel/index.js";
import type { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import type { ProdutoId, TipoProduto } from "./tipos.js";

export function validarLocatarioId(v: unknown): Result<LocatarioId, ErroApp> {
  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO" as never, mensagem: "Locatário obrigatório.", detalhes: { operacao: "produtos.validarLocatarioId" } });
  return wrapOk(v.trim() as LocatarioId);
}
export function validarProdutoId(v: unknown): Result<ProdutoId, ErroApp> {
  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "INVALIDO", mensagem: "Produto inválido.", detalhes: { operacao: "produtos.validarProdutoId" } });
  return wrapOk(v.trim() as ProdutoId);
}
export function validarNomeProduto(v: unknown): Result<string, ErroApp> {
  if (typeof v !== "string" || v.trim().length < 2) return createErroApp({ codigo: "INVALIDO", mensagem: "Nome inválido.", detalhes: { operacao: "produtos.validarNome" } });
  return wrapOk(v.trim());
}
export function validarTipoProduto(v: unknown): Result<TipoProduto, ErroApp> {
  if (v !== "PRODUTO" && v !== "SERVICO") return createErroApp({ codigo: "INVALIDO", mensagem: "Tipo inválido.", detalhes: { operacao: "produtos.validarTipo" } });
  return wrapOk(v);
}
export function validarUnidade(v: unknown): Result<string, ErroApp> {
  if (v === undefined || v === null || v === "") return wrapOk("UN");
  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "INVALIDO", mensagem: "Unidade inválida.", detalhes: { operacao: "produtos.validarUnidade" } });
  return wrapOk(v.trim().toUpperCase());
}
export function validarValorNaoNegativo(v: unknown, campo: string): Result<number, ErroApp> {
  if (v === undefined || v === null) return wrapOk(0);
  if (typeof v !== "number" || Number.isNaN(v) || v < 0) return createErroApp({ codigo: "INVALIDO", mensagem: `${campo} inválido.`, detalhes: { operacao: "produtos.validarValor", campo } });
  return wrapOk(v);
}
export function validarValorOpcionalNaoNegativo(v: unknown, campo: string): Result<number | null, ErroApp> {
  if (v === undefined || v === null) return wrapOk(null);
  if (typeof v !== "number" || Number.isNaN(v) || v < 0) return createErroApp({ codigo: "INVALIDO", mensagem: `${campo} inválido.`, detalhes: { operacao: "produtos.validarValorOpcional", campo } });
  return wrapOk(v);
}
export function validarTextoOpcional(v: unknown): Result<string | null, ErroApp> {
  if (v === undefined || v === null || v === "") return wrapOk(null);
  if (typeof v !== "string") return createErroApp({ codigo: "INVALIDO", mensagem: "Texto inválido.", detalhes: { operacao: "produtos.validarTextoOpcional" } });
  return wrapOk(v.trim() || null);
}

export function validarSkuProduto(value: string | null | undefined): Result<string | null, ErroApp>  {
  return wrapOk(value?.trim() || null);
}

export function validarDescricaoProduto(value: string | null | undefined): Result<string | null, ErroApp>  {
  return wrapOk(value?.trim() || null);
}

export function validarUnidadeProduto(value: string) {
  const unidade = value.trim();
  if (!unidade) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Unidade do produto é obrigatória.",
    });
  }
  return wrapOk(unidade);
}

export function validarPrecoVendaProduto(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Preço de venda deve ser maior ou igual a zero.",
    });
  }
  return wrapOk(value);
}

export function validarCustoReferenciaProduto(value: number | null | undefined) {
  if (value === null || value === undefined) return wrapOk(null);

  if (!Number.isFinite(value) || value < 0) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Custo de referência deve ser maior ou igual a zero.",
    });
  }

  return wrapOk(value);
}
