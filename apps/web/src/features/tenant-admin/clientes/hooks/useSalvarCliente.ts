// apps/web/src/features/tenant-admin/clientes/hooks/useSalvarCliente.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { clientesApi } from "../api/clientesApi";
import type { AtualizarClienteInput, CriarClienteInput } from "../tipos";

type Params = {
  mode: "create" | "edit";
  clienteId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useSalvarCliente({ mode, clienteId, onSuccess }: Params) {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(input: CriarClienteInput | AtualizarClienteInput) {
    setIsSaving(true);
    setErro(null);

    try {
      if (mode === "create") {
        await clientesApi.criar(input as CriarClienteInput);
      } else {
        const id = clienteId?.trim();

        if (!id) {
          setErro("ID do cliente inválido.");
          return false;
        }

        await clientesApi.atualizar(id, input as AtualizarClienteInput);
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