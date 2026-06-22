// apps/web/src/features/tenant-admin/fornecedores/hooks/useFornecedorDetails.ts

import { useEntityDetails } from "../../shared/crud-hooks";
import { fornecedoresApi } from "../api/fornecedoresApi";
import type { Fornecedor } from "../tipos";

export function useFornecedorDetails(fornecedorId?: string) {
  const result = useEntityDetails<Fornecedor>({
    id: fornecedorId,
    invalidIdMessage: "Fornecedor inválido.",
    fetcher: fornecedoresApi.obter,
  });

  return {
    fornecedor: result.item,
    isLoading: result.isLoading,
    erro: result.erro,
    reload: result.reload,
    setFornecedor: result.setItem,
  };
}
