// apps/web/src/features/tenant-admin/produtos/hooks/useSalvarProduto.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { produtosApi } from "../api/produtosApi";
import type {
  AtualizarProdutoInput,
  CriarProdutoInput,
  Produto,
} from "../tipos";

type Params = {
  mode: "create" | "edit";
  produtoId?: string;
  onSuccess?: (produto: Produto) => void | Promise<void>;
};

export function useSalvarProduto({ mode, produtoId, onSuccess }: Params) {
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(input: CriarProdutoInput | AtualizarProdutoInput) {
    setIsSaving(true);
    setErro(null);

    try {
      const response =
        mode === "create"
          ? await produtosApi.criar(input as CriarProdutoInput)
          : await atualizarProduto(input as AtualizarProdutoInput);

      await onSuccess?.(response.item);
      return true;
    } catch (error) {
      setErro(mapError(error).message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function atualizarProduto(input: AtualizarProdutoInput) {
    const id = produtoId?.trim();

    if (!id) {
      throw new Error("Produto inválido.");
    }

    return produtosApi.atualizar(id, input);
  }

  return {
    salvar,
    isSaving,
    erro,
  };
}
