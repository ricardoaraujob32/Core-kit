// apps/web/src/features/tenant-admin/locatario/hooks/useSalvarConfiguracaoLocatario.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { meuLocatarioApi } from "../api/meuLocatarioApi";
import type { AtualizarConfiguracaoLocatarioInput, CriarConfiguracaoLocatarioInput } from "../tipos";

type Params = {
  mode: "create" | "edit";
  locatarioId?: string | null;
  configuracaoId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useSalvarConfiguracaoLocatario({
  mode,
  locatarioId,
  configuracaoId,
  onSuccess,
}: Params) {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(
    input:
      | CriarConfiguracaoLocatarioInput
      | AtualizarConfiguracaoLocatarioInput,
  ) {
    const id = locatarioId?.trim();

    if (!id) {
      setErro("Locatário inválido.");
      return false;
    }

    setIsSaving(true);
    setErro(null);

    try {
      if (mode === "create") {
        await meuLocatarioApi.criarConfiguracao(
          id,
          input as CriarConfiguracaoLocatarioInput,
        );
      } else {
        const confId = configuracaoId?.trim();

        if (!confId) {
          setErro("Configuração inválida.");
          return false;
        }

        await meuLocatarioApi.atualizarConfiguracao(
          id,
          confId,
          input as AtualizarConfiguracaoLocatarioInput,
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
