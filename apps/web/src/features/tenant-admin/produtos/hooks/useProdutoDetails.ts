// apps/web/src/features/tenant-admin/produtos/hooks/useProdutoDetails.ts

import { useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { produtosApi } from "../api/produtosApi";
import type { Produto } from "../tipos";

export function useProdutoDetails(produtoId?: string) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!produtoId?.trim()) {
        setErro("Produto inválido.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErro(null);

      try {
        const response = await produtosApi.obter(produtoId);

        if (ativo) {
          setProduto(response.item);
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
  }, [produtoId]);

  return {
    produto,
    isLoading,
    erro,
  };
}
