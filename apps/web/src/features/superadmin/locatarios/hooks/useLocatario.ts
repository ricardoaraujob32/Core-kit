// apps/web/src/features/superadmin/locatarios/hooks/useLocatario.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { locatariosApi } from "../api/locatariosApi";
import type { Locatario } from "../tipos";

export function useLocatario(locatarioId?: string) {
  const [item, setItem] = useState<Locatario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!locatarioId?.trim()) {
      setItem(null);
      setErro("ID do locatário inválido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const response = await locatariosApi.obter(locatarioId);
      setItem(response.item);
    } catch (error) {
      setErro(mapError(error).message);
      setItem(null);
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