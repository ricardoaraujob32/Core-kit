// apps/web/src/features/superadmin/locatarios/hooks/useUsuariosLocatario.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import {
  usuariosLocatarioApi,
  type UsuarioLocatario,
} from "../api/usuariosLocatarioApi";

export function useUsuariosLocatario(locatarioId?: string) {
  const [itens, setItens] = useState<UsuarioLocatario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!locatarioId?.trim()) {
      setErro("ID do locatário inválido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const response = await usuariosLocatarioApi.listar(locatarioId);
      setItens(response.itens);
    } catch (error) {
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
    isLoading,
    erro,
    recarregar: carregar,
  };
}
