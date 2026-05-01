// packages/core/src/produtos/tipos.ts

import type { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

export type ProdutoId = string;
export type TipoProduto = "PRODUTO" | "SERVICO";
export type ProdutoStatus = "ATIVO" | "INATIVO" | "EXCLUIDO";

export type Produto = {
  produtoId: ProdutoId;
  locatarioId: LocatarioId;
  sku: string | null;
  nome: string;
  descricao: string | null;
  unidade: string;
  tipo: TipoProduto;
  status: ProdutoStatus;
  precoVenda: number;
  custoReferencia: number | null;
  criadoEm: Date;
  atualizadoEm: Date;
  excluidoEm: Date | null;
  excluidoPor: UsuarioId | null;
  excluidoMotivo: string | null;
};

export type CriarProdutoInput = { locatarioId: LocatarioId; sku?: string | null; nome: string; descricao?: string | null; unidade?: string; tipo: TipoProduto; precoVenda?: number; custoReferencia?: number | null };
export type CriarProdutoOutput = { produtoId: ProdutoId };
export type CriarProdutoResult = Promise<Result<CriarProdutoOutput, ErroApp>>;
export type ObterProdutoInput = { locatarioId: LocatarioId; produtoId: ProdutoId };
export type ObterProdutoOutput = { produto: Produto };
export type ObterProdutoResult = Promise<Result<ObterProdutoOutput, ErroApp>>;
export type ListarProdutosInput = { locatarioId: LocatarioId; tipo?: TipoProduto; cursor?: ProdutoId; limite?: number };
export type ListarProdutosOutput = { itens: Produto[] };
export type ListarProdutosResult = Promise<Result<ListarProdutosOutput, ErroApp>>;
export type InativarProdutoInput = { locatarioId: LocatarioId; produtoId: ProdutoId };
export type InativarProdutoOutput = { produto: Produto };
export type InativarProdutoResult = Promise<Result<InativarProdutoOutput, ErroApp>>;
export type ReativarProdutoInput = { locatarioId: LocatarioId; produtoId: ProdutoId };
export type ReativarProdutoOutput = { produto: Produto };
export type ReativarProdutoResult = Promise<Result<ReativarProdutoOutput, ErroApp>>;

export type AtualizarProdutoInput = {
  locatarioId: LocatarioId;
  produtoId: ProdutoId;
  sku?: string | null;
  nome?: string;
  descricao?: string | null;
  unidade?: string;
  tipo?: TipoProduto;
  precoVenda?: number;
  custoReferencia?: number | null;
};

export type AtualizarProdutoOutput = {
  produto: Produto;
};

export type AtualizarProdutoResult = Promise<Result<AtualizarProdutoOutput, ErroApp>>;

export type ExcluirProdutoInput = {
  locatarioId: LocatarioId;
  produtoId: ProdutoId;
  excluidoPor?: UsuarioId | null;
  excluidoMotivo?: string | null;
};

export type ExcluirProdutoOutput = {
  produto: Produto;
};

export type ExcluirProdutoResult = Promise<Result<ExcluirProdutoOutput, ErroApp>>;
