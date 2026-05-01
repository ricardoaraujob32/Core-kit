// apps/web/src/features/tenant-admin/produtos/hooks/useProdutoActions.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { produtosApi } from "../api/produtosApi";

type Params = {
  onSuccess?: () => void | Promise<void>;
};

export function useProdutoActions({ onSuccess }: Params = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function excluir(produtoId: string) {
    const id = produtoId.trim();

    if (!id) {
      setErro("ID do produto inválido.");
      return false;
    }

    setIsSubmitting(true);
    setErro(null);

    try {
      await produtosApi.excluir(id);
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