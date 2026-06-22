// apps/web/src/features/tenant-admin/produtos/hooks/useProdutoDetails.ts

import { useEntityDetails } from "../../shared/crud-hooks";
import { produtosApi } from "../api/produtosApi";
import type { Produto } from "../tipos";

export function useProdutoDetails(produtoId?: string) {
  const result = useEntityDetails<Produto>({
    id: produtoId,
    invalidIdMessage: "Produto inválido.",
    fetcher: produtosApi.obter,
  });

  return {
    produto: result.item,
    isLoading: result.isLoading,
    erro: result.erro,
    reload: result.reload,
    setProduto: result.setItem,
  };
}
