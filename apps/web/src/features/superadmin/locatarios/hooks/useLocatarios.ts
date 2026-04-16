// apps/web/src/features/superadmin/locatarios/hooks/useLocatarios.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { locatariosApi } from "../api/locatariosApi";
import type { Locatario } from "../tipos";

export function useLocatarios() {
  const [itens, setItens] = useState<Locatario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const response = await locatariosApi.listar();
      setItens(response.itens);
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
    itens,
    isLoading,
    erro,
    recarregar: carregar,
  };
}
