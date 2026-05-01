// apps/web/src/features/tenant-admin/transacoes/hooks/useTransacoes.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { transacoesApi } from "../api/transacoesApi";
import type { TipoTransacao, Transacao } from "../tipos";

type FiltroTipo = TipoTransacao | "TODOS";

function filtrarTransacoes(
  transacoes: Transacao[],
  busca: string,
  tipo: FiltroTipo,
): Transacao[] {
  const termo = busca.trim().toLowerCase();

  return transacoes.filter((transacao) => {
    const atendeTipo = tipo === "TODOS" || transacao.tipo === tipo;
    const atendeBusca =
      !termo ||
      transacao.transacaoId.toLowerCase().includes(termo) ||
      transacao.status.toLowerCase().includes(termo);

    return atendeTipo && atendeBusca;
  });
}

export function useTransacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<FiltroTipo>("TODOS");
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const response = await transacoesApi.listar();
      setTransacoes(response.itens);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const transacoesFiltradas = useMemo(
    () => filtrarTransacoes(transacoes, busca, tipo),
    [transacoes, busca, tipo],
  );

  return {
    transacoes,
    transacoesFiltradas,
    busca,
    setBusca,
    tipo,
    setTipo,
    isLoading,
    erro,
    recarregar: carregar,
  };
}