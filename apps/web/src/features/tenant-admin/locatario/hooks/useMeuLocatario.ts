// apps/web/src/features/tenant-admin/locatario/hooks/useMeuLocatario.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { meuLocatarioApi } from "../api/meuLocatarioApi";
import type { MeuLocatario } from "../tipos";

export function useMeuLocatario(locatarioId?: string | null) {
  const [item, setItem] = useState<MeuLocatario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const id = locatarioId?.trim();

    if (!id) {
      setItem(null);
      setErro("Locatário inválido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const response = await meuLocatarioApi.obterMeuLocatario(id);
      setItem(response.item);
    } catch (error) {
      setItem(null);
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, [locatarioId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    item,
    isLoading,
    erro,
    recarregar: carregar,
  };
}
