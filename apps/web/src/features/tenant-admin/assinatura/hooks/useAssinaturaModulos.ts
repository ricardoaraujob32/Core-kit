// apps/web/src/features/tenant-admin/assinatura/hooks/useAssinaturaModulos.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { assinaturaModulosApi } from "../api/assinaturaModulosApi";
import type { ModuloAssinatura } from "../tipos";

export function useAssinaturaModulos() {
  const [locatarioId, setLocatarioId] = useState<string | null>(null);
  const [modulos, setModulos] = useState<ModuloAssinatura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const response = await assinaturaModulosApi.listar();
      setLocatarioId(response.locatarioId);
      setModulos(response.modulos);
    } catch (error) {
      setModulos([]);
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    locatarioId,
    modulos,
    isLoading,
    erro,
    recarregar: carregar,
  };
}