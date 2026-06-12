// apps/web/src/features/tenant-admin/locatario/hooks/useAtivarConfiguracaoLocatario.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { meuLocatarioApi } from "../api/meuLocatarioApi";

export function useAtivarConfiguracaoLocatario( onSuccess?: () => void | Promise<void>) {
  const [isRunning, setIsRunning] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function ativar(configuracaoId: string) {
    const confId = configuracaoId?.trim();

    if (!confId) {
      setErro("Configuração inválida.");
      return false;
    }

    setIsRunning(true);
    setErro(null);

    try {
      await meuLocatarioApi.ativarConfiguracao(confId);
      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsRunning(false);
    }
  }

  return {
    ativar,
    isRunning,
    erro,
  };
}
