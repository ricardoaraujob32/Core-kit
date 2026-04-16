// apps/web/src/features/tenant-admin/locatario/hooks/useConfiguracoesLocatario.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { meuLocatarioApi } from "../api/meuLocatarioApi";
import type { ConfiguracaoLocatario } from "../tipos";

export function useConfiguracoesLocatario(locatarioId?: string | null) {
  const [itens, setItens] = useState<ConfiguracaoLocatario[]>([]);
  const [configuracaoAtiva, setConfiguracaoAtiva] =
    useState<ConfiguracaoLocatario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const id = locatarioId?.trim();

    if (!id) {
      setItens([]);
      setConfiguracaoAtiva(null);
      setErro("Locatário inválido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const [lista, ativa] = await Promise.all([
        meuLocatarioApi.listarConfiguracoes(id),
        meuLocatarioApi.obterConfiguracaoAtiva(id),
      ]);

      setItens(lista.itens);
      setConfiguracaoAtiva(ativa.item ?? null);
    } catch (error) {
      setItens([]);
      setConfiguracaoAtiva(null);
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, [locatarioId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    itens,
    configuracaoAtiva,
    isLoading,
    erro,
    recarregar: carregar,
  };
}
