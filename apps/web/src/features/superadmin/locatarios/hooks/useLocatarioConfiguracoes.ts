// apps/web/src/features/superadmin/locatarios/hooks/useLocatarioConfiguracoes.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import {
  locatarioConfiguracoesApi,
  type BrandingLocatario,
  type ModuloAssinaturaLocatario,
} from "../api/locatarioConfiguracoesApi";

export function useLocatarioConfiguracoes(locatarioId?: string) {
  const [branding, setBranding] = useState<BrandingLocatario | null>(null);
  const [modulos, setModulos] = useState<ModuloAssinaturaLocatario[]>([]);
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
      const [brandingResponse, modulosResponse] = await Promise.all([
        locatarioConfiguracoesApi.obterBranding(locatarioId),
        locatarioConfiguracoesApi.listarModulos(locatarioId),
      ]);

      setBranding(brandingResponse.item);
      setModulos(modulosResponse.modulos);
    } catch (error) {
      setErro(mapError(error).message);
    } finally {
      setIsLoading(false);
    }
  }, [locatarioId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return { branding, modulos, isLoading, erro, recarregar: carregar };
}
