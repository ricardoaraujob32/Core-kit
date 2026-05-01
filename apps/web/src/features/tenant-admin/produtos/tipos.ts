// apps/web/src/features/tenant-admin/produtos/tipos.ts

export type TipoProduto = "PRODUTO" | "SERVICO";

export type Produto = {
  produtoId: string;
  locatarioId: string;
  nome: string;
  tipo: TipoProduto;
  precoVenda: number;
  descricao?: string | null;
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

export type CriarProdutoInput = {
  nome: string;
  tipo: TipoProduto;
  precoVenda: number;
  descricao?: string | null;
};

export type CriarProdutoResponse = {
  item: Produto;
};

export type AtualizarProdutoInput = {
  nome?: string;
  tipo?: TipoProduto;
  precoVenda?: number;
  descricao?: string | null;
};

export type AtualizarProdutoResponse = {
  item: Produto;
};

export type ExcluirProdutoResponse = {
  item?: Produto;
  sucesso?: boolean;
};