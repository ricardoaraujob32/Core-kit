// apps/web/src/features/tenant-admin/produtos/produto.viewModel.ts

import type { TenantViewModel } from "../../../shared/tenantViewModel";
import {
  fallbackTexto,
  formatarMoedaBR,
  juntarPartes,
} from "../../../shared/tenantViewModel";

export type ProdutoViewModelInput = {
  produtoId: string;
  nome?: string | null;
  codigo?: string | null;
  sku?: string | null;
  precoVenda?: number | string | null;
  status?: string | null;
  estoqueAtual?: number | string | null;
};

export function toProdutoViewModel(
  produto: ProdutoViewModelInput,
): TenantViewModel {
  const codigo = produto.codigo ?? produto.sku;
  const preco = formatarMoedaBR(produto.precoVenda);

  return {
    key: produto.produtoId,
    titulo: fallbackTexto(produto.nome, "Produto sem nome"),
    subtitulo: codigo ? `Código: ${codigo}` : "Sem código",
    contexto: juntarPartes([
      preco ? `Preço: ${preco}` : undefined,
      produto.estoqueAtual !== null && produto.estoqueAtual !== undefined
        ? `Estoque: ${produto.estoqueAtual}`
        : undefined,
    ]),
    status: produto.status ?? undefined,
  };
}
