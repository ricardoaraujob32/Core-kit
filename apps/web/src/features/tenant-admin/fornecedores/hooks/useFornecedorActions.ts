// apps/web/src/features/tenant-admin/fornecedores/hooks/useFornecedorActions.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { fornecedoresApi } from "../api/fornecedoresApi";

type Params = {
  onSuccess?: () => void | Promise<void>;
};

export function useFornecedorActions({ onSuccess }: Params = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function excluir(fornecedorId: string) {
    const id = fornecedorId.trim();

    if (!id) {
      setErro("ID do fornecedor inválido.");
      return false;
    }

    setIsSubmitting(true);
    setErro(null);

    try {
      await fornecedoresApi.excluir(id);
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