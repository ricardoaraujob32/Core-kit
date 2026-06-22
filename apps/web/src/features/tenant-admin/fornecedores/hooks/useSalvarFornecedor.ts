// apps/web/src/features/tenant-admin/fornecedores/hooks/useSalvarFornecedor.ts

import { useEntitySave } from "../../shared/crud-hooks";
import { fornecedoresApi } from "../api/fornecedoresApi";
import type {
  AtualizarFornecedorInput,
  CriarFornecedorInput,
  Fornecedor,
} from "../tipos";

type Params = {
  mode: "create" | "edit";
  fornecedorId?: string;
  onSuccess?: (fornecedor: Fornecedor) => void | Promise<void>;
};

export function useSalvarFornecedor({
  mode,
  fornecedorId,
  onSuccess,
}: Params) {
  return useEntitySave<
    CriarFornecedorInput,
    AtualizarFornecedorInput,
    Fornecedor
  >({
    mode,
    id: fornecedorId,
    invalidIdMessage: "Fornecedor inválido.",
    create: fornecedoresApi.criar,
    update: fornecedoresApi.atualizar,
    onSuccess,
  });
}
