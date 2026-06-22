// apps/web/src/features/tenant-admin/clientes/hooks/useClienteDetails.ts

import { useEntityDetails } from "../../shared/crud-hooks";
import { clientesApi } from "../api/clientesApi";
import type { Cliente } from "../tipos";

export function useClienteDetails(clienteId?: string) {
  const result = useEntityDetails<Cliente>({
    id: clienteId,
    invalidIdMessage: "Cliente inválido.",
    fetcher: clientesApi.obter,
  });

  return {
    cliente: result.item,
    isLoading: result.isLoading,
    erro: result.erro,
    reload: result.reload,
    setCliente: result.setItem,
  };
}
