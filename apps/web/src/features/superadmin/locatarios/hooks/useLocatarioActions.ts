// apps/web/src/features/superadmin/locatarios/hooks/useLocatarioActions.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { locatariosApi } from "../api/locatariosApi";

type ActionName = "suspender" | "reativar" | "encerrar";

export function useLocatarioActions(onSuccess?: () => void | Promise<void>) {
  const [isRunning, setIsRunning] = useState<ActionName | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function suspender(locatarioId: string, motivoSuspensao?: string) {
    setIsRunning("suspender");
    setErro(null);

    try {
      await locatariosApi.suspender(locatarioId, { motivoSuspensao });
      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsRunning(null);
    }
  }

  async function reativar(locatarioId: string, motivoReativacao?: string) {
    setIsRunning("reativar");
    setErro(null);

    try {
      await locatariosApi.reativar(locatarioId, { motivoReativacao });
      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsRunning(null);
    }
  }

  async function encerrar(locatarioId: string, motivoExclusao?: string) {
    setIsRunning("encerrar");
    setErro(null);

    try {
      await locatariosApi.encerrar(locatarioId, { motivoExclusao });
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
    erro,
    isRunning,
    suspender,
    reativar,
    encerrar,
  };
}