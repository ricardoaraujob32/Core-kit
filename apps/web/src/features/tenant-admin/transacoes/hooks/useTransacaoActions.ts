// apps/web/src/features/tenant-admin/transacoes/hooks/useTransacaoActions.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { transacoesApi } from "../api/transacoesApi";
import type { AdicionarItemTransacaoInput, AtualizarItemTransacaoInput, CancelarTransacaoInput } from "../tipos";

type Params = {
  transacaoId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useTransacaoActions({ transacaoId, onSuccess }: Params = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function validarId(): string | null {
    const id = transacaoId?.trim();

    if (!id) {
      setErro("ID da transação inválido.");
      return null;
    }

    return id;
  }

  async function executar(fn: (id: string) => Promise<unknown>) {
    const id = validarId();
    if (!id) return false;

    setIsSubmitting(true);
    setErro(null);

    try {
      await fn(id);
      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    erro,

    adicionarItem(input: AdicionarItemTransacaoInput) {
      return executar((id) => transacoesApi.adicionarItem(id, input));
    },

    atualizarItem(itemId: string, input: AtualizarItemTransacaoInput) {
      return executar((id) => transacoesApi.atualizarItem(id, itemId, input));
    },

    removerItem(itemId: string) {
      return executar((id) => transacoesApi.removerItem(id, itemId));
    },

    confirmar() {
      return executar((id) => transacoesApi.confirmar(id));
    },

    cancelar(input: CancelarTransacaoInput = {}) {
      return executar((id) => transacoesApi.cancelar(id, input));
    },
  };
}