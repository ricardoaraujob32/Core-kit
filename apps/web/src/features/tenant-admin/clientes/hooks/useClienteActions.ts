// apps/web/src/features/tenant-admin/clientes/hooks/useClienteActions.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../api/clientesApi";

type Params = {
  onSuccess?: () => void | Promise<void>;
};

export function useClienteActions({ onSuccess }: Params = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function excluir(clienteId: string) {
    const id = clienteId.trim();

    if (!id) {
      setErro("ID do cliente inválido.");
      return false;
    }

    setIsSubmitting(true);
    setErro(null);

    try {
      await clientesApi.excluir(id);
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
    excluir,
    isSubmitting,
    erro,
  };
}