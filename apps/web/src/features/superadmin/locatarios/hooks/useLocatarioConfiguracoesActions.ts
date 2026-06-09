// apps/web/src/features/superadmin/locatarios/hooks/useLocatarioConfiguracoesActions.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import {
  locatarioConfiguracoesApi,
  type AtualizarBrandingLocatarioInput,
} from "../api/locatarioConfiguracoesApi";

type RunningAction = "branding" | "vincular-modulo" | "desvincular-modulo";

type Params = {
  locatarioId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useLocatarioConfiguracoesActions({ locatarioId, onSuccess }: Params) {
  const [isRunning, setIsRunning] = useState<RunningAction | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function finalizar(mensagem: string) {
    setSucesso(mensagem);
    await onSuccess?.();
  }

  async function atualizarBranding(input: AtualizarBrandingLocatarioInput) {
    if (!locatarioId?.trim()) {
      setErro("ID do locatário inválido.");
      return false;
    }

    setIsRunning("branding");
    setErro(null);
    setSucesso(null);

    try {
      await locatarioConfiguracoesApi.atualizarBranding(locatarioId, input);
      await finalizar("Branding atualizado com sucesso.");
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsRunning(null);
    }
  }

  async function vincularModulo(codigo: string) {
    if (!locatarioId?.trim()) {
      setErro("ID do locatário inválido.");
      return false;
    }

    const codigoNormalizado = codigo.trim().toUpperCase();
    if (!codigoNormalizado) {
      setErro("Informe o código do módulo.");
      return false;
    }

    setIsRunning("vincular-modulo");
    setErro(null);
    setSucesso(null);

    try {
      await locatarioConfiguracoesApi.vincularModulo(locatarioId, {
        codigo: codigoNormalizado,
      });
      await finalizar("Módulo vinculado com sucesso.");
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsRunning(null);
    }
  }

  async function desvincularModulo(codigo: string) {
    if (!locatarioId?.trim()) {
      setErro("ID do locatário inválido.");
      return false;
    }

    const codigoNormalizado = codigo.trim().toUpperCase();
    if (!codigoNormalizado) {
      setErro("Informe o código do módulo.");
      return false;
    }

    const confirmado = window.confirm(`Remover o módulo ${codigoNormalizado} deste locatário?`);
    if (!confirmado) return false;

    setIsRunning("desvincular-modulo");
    setErro(null);
    setSucesso(null);

    try {
      await locatarioConfiguracoesApi.desvincularModulo(locatarioId, codigoNormalizado);
      await finalizar("Módulo removido com sucesso.");
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsRunning(null);
    }
  }

  return { atualizarBranding, vincularModulo, desvincularModulo, isRunning, erro, sucesso };
}
