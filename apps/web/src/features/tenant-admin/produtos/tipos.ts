// apps/web/src/features/tenant-admin/produtos/tipos.ts

export type TipoProduto = "PRODUTO" | "SERVICO";

export type Produto = {
  produtoId: string;
  locatarioId: string;
  sku?: string | null;
  nome: string;
  descricao?: string | null;
  unidade: string;
  tipo: TipoProduto;
  precoVenda: number;
  custoReferencia?: number | null;
  ativo?: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  excluidoEm?: string | null;
};

export type ListarProdutosResponse = {
  itens: Produto[];
};

export type ObterProdutoResponse = {
  item: Produto;
};

export type CriarProdutoResponse = {
  item: Produto;
};

export type AtualizarProdutoResponse = {
  item: Produto;
};

export type ExcluirProdutoResponse = void;

export type CriarProdutoInput = {
  sku?: string | null;
  nome: string;
  descricao?: string | null;
  unidade?: string;
  tipo: TipoProduto;
  precoVenda?: number;
  custoReferencia?: number | null;
  ativo?: boolean;
};

export type AtualizarProdutoInput = Partial<CriarProdutoInput>;
