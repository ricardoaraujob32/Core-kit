// apps/web/src/features/tenant-admin/fornecedores/hooks/useSalvarFornecedor.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { fornecedoresApi } from "../api/fornecedoresApi";
import type { AtualizarFornecedorInput, CriarFornecedorInput } from "../tipos";

type Params = {
  mode: "create" | "edit";
  fornecedorId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useSalvarFornecedor({ mode, fornecedorId, onSuccess }: Params) {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(input: CriarFornecedorInput | AtualizarFornecedorInput) {
    setIsSaving(true);
    setErro(null);

    try {
      if (mode === "create") {
        await fornecedoresApi.criar(input as CriarFornecedorInput);
      } else {
        const id = fornecedorId?.trim();

        if (!id) {
          setErro("ID do fornecedor inválido.");
          return false;
        }

        await fornecedoresApi.atualizar(
          id,
          input as AtualizarFornecedorInput,
        );
      }

      await onSuccess?.();
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    salvar,
    isSaving,
    erro,
  };
}