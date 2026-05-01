// apps/web/src/features/tenant-admin/produtos/hooks/useSalvarProduto.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { produtosApi } from "../api/produtosApi";
import type { AtualizarProdutoInput, CriarProdutoInput } from "../tipos";

type Params = {
  mode: "create" | "edit";
  produtoId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useSalvarProduto({ mode, produtoId, onSuccess }: Params) {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(input: CriarProdutoInput | AtualizarProdutoInput) {
    setIsSaving(true);
    setErro(null);

    try {
      if (mode === "create") {
        await produtosApi.criar(input as CriarProdutoInput);
      } else {
        const id = produtoId?.trim();

        if (!id) {
          setErro("ID do produto inválido.");
          return false;
        }

        await produtosApi.atualizar(id, input as AtualizarProdutoInput);
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