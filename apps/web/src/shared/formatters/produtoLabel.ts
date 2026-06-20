
import { cleanText } from "./commonLabel";

export function formatProdutoLabel(produto: any): string {
  const nome = cleanText(produto.nome) ?? "Produto sem nome";
  const codigo = produto.codigo ?? produto.sku ?? "sem código";
  return `${nome} — ${codigo}`;
}

export const formatProdutoOptionLabel = formatProdutoLabel;
