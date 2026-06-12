// apps/web/src/features/tenant-admin/transacoes/hooks/useTransacaoDetails.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { transacoesApi } from "../api/transacoesApi";
import type { TransacaoDetalhada } from "../tipos";

export function useTransacaoDetails(transacaoId?: string) {
  const [transacao, setTransacao] = useState<TransacaoDetalhada | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!transacaoId?.trim()) {
      setErro("ID da transação inválido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const response = await transacoesApi.obter(transacaoId);
      setTransacao(response.item);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, [transacaoId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    transacao,
    isLoading,
    erro,
    recarregar: carregar,
  };
}