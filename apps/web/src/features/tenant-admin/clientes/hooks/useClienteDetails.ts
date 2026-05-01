// apps/web/src/features/tenant-admin/clientes/hooks/useClienteDetails.ts

import { useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../api/clientesApi";
import type { Cliente } from "../tipos";

export function useClienteDetails(clienteId?: string) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!clienteId?.trim()) {
        setErro("ID do cliente inválido.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErro(null);

      try {
        const response = await clientesApi.obter(clienteId);

        if (ativo) {
          setCliente(response.item);
        }
      } catch (error) {
        if (ativo) {
          setErro(mapError(error).message);
        }
      } finally {
        if (ativo) {
          setIsLoading(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [clienteId]);

  return {
    cliente,
    isLoading,
    erro,
  };
}