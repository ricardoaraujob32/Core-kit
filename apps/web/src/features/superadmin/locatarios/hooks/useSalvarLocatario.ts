// apps/web/src/features/superadmin/locatarios/hooks/useSalvarLocatario.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { locatariosApi } from "../api/locatariosApi";
import type { AtualizarLocatarioInput, CriarLocatarioInput } from "../tipos";

type Params = {
  mode: "create" | "edit";
  locatarioId?: string;
  onSuccess?: (locatarioId?: string) => void | Promise<void>;
};

export function useSalvarLocatario({ mode, locatarioId, onSuccess, }: Params) {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(input: CriarLocatarioInput | AtualizarLocatarioInput) {
    setIsSaving(true);
    setErro(null);

    try {
      if (mode === "create") {
        const response = await locatariosApi.criar(input as CriarLocatarioInput);
        await onSuccess?.(response.item.locatarioId);
      } else {
        const id = locatarioId?.trim();

        if (!id) {
          setErro("ID do locatário inválido.");
          return false;
        }

        await locatariosApi.atualizar(id, input as AtualizarLocatarioInput);
        await onSuccess?.(id);
      }

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