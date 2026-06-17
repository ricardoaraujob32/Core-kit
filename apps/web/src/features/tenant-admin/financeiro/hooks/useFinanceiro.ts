// apps/web/src/features/tenant-admin/financeiro/hooks/useFinanceiro.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { financeiroApi } from "../api/financeiroApi";
import type { ContaFinanceira, ResumoFinanceiro } from "../tipos";

export function useFinanceiro() {
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [contasReceber, setContasReceber] = useState<ContaFinanceira[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaFinanceira[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const [resumoResponse, receberResponse, pagarResponse] = await Promise.all([
        financeiroApi.obterResumo(),
        financeiroApi.listarContasReceber({ status: "ABERTO", limite: 20 }),
        financeiroApi.listarContasPagar({ status: "ABERTO", limite: 20 }),
      ]);

      setResumo(resumoResponse.item);
      setContasReceber(receberResponse.itens);
      setContasPagar(pagarResponse.itens);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    resumo,
    contasReceber,
    contasPagar,
    isLoading,
    erro,
    recarregar: carregar,
  };
}
