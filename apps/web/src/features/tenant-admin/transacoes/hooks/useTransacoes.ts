// apps/web/src/features/tenant-admin/transacoes/hooks/useTransacoes.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import {
  formatTransacaoTitulo,
  shortCode,
} from "../../../../shared/formatters";
import { transacoesApi } from "../api/transacoesApi";
import type { TipoTransacao, Transacao } from "../tipos";

type FiltroTipo = TipoTransacao | "TODOS";

function normalizar(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function filtrarTransacoes(
  transacoes: Transacao[],
  busca: string,
  tipo: FiltroTipo,
): Transacao[] {
  const termo = normalizar(busca);

  return transacoes.filter((transacao) => {
    const atendeTipo = tipo === "TODOS" || transacao.tipo === tipo;

    if (!termo) return atendeTipo;

    const textoBusca = [
      formatTransacaoTitulo({
        tipo: transacao.tipo,
        criadoEm: transacao.criadoEm,
        fallbackId: transacao.transacaoId,
      }),
      transacao.tipo,
      transacao.status,
      transacao.clienteId,
      transacao.fornecedorId,
      shortCode(transacao.transacaoId),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return atendeTipo && textoBusca.includes(termo);
  });
}

export function useTransacoes(enabled = true) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<FiltroTipo>("TODOS");
  const [isLoading, setIsLoading] = useState(enabled);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!enabled) {
      setTransacoes([]);
      setErro(null);
      setIsLoading(false);
      return;
    }

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
  }, [enabled]);

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
