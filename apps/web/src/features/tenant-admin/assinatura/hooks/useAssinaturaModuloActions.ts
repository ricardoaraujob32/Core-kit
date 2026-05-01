// apps/web/src/features/tenant-admin/assinatura/hooks/useAssinaturaModuloActions.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { assinaturaModulosApi } from "../api/assinaturaModulosApi";

type ActionName = "vincular" | "desvincular";

type Params = {
  onSuccess?: () => void | Promise<void>;
};

export function useAssinaturaModuloActions({ onSuccess }: Params = {}) {
  const [isRunning, setIsRunning] = useState<ActionName | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function vincular(moduloId: string) {
    const id = moduloId.trim();

    if (!id) {
      setErro("Informe o ID do módulo.");
      return false;
    }

    setIsRunning("vincular");
    setErro(null);
    setSucesso(null);

    try {
      await assinaturaModulosApi.vincular({ moduloId: id });
      setSucesso("Módulo vinculado com sucesso.");
      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsRunning(null);
    }
  }

  async function desvincular(moduloId: string) {
    const id = moduloId.trim();

    if (!id) {
      setErro("Módulo inválido.");
      return false;
    }

    setIsRunning("desvincular");
    setErro(null);
    setSucesso(null);

    try {
      await assinaturaModulosApi.desvincular(id);
      setSucesso("Módulo desvinculado com sucesso.");
      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsRunning(null);
    }
  }

  return {
    vincular,
    desvincular,
    isRunning,
    erro,
    sucesso,
  };
}