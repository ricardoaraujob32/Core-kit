// apps/web/src/features/tenant-admin/fornecedores/hooks/useFornecedorDetails.ts

import { useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { fornecedoresApi } from "../api/fornecedoresApi";
import type { Fornecedor } from "../tipos";

export function useFornecedorDetails(fornecedorId?: string) {
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!fornecedorId?.trim()) {
        setErro("ID do fornecedor inválido.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErro(null);

      try {
        const response = await fornecedoresApi.obter(fornecedorId);

      if (ativo) {
        setFornecedor(response.item);
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
  }, [fornecedorId]);

  return {
    fornecedor,
    isLoading,
    erro,
  };
}