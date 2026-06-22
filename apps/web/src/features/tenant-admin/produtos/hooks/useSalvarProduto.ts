// apps/web/src/features/tenant-admin/produtos/hooks/useSalvarProduto.ts

import { useEntitySave } from "../../shared/crud-hooks";
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
  return useEntitySave<CriarProdutoInput, AtualizarProdutoInput, Produto>({
    mode,
    id: produtoId,
    invalidIdMessage: "Produto inválido.",
    create: produtosApi.criar,
    update: produtosApi.atualizar,
    onSuccess,
  });
}
