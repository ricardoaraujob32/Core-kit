// apps/web/src/features/tenant-admin/clientes/hooks/useSalvarCliente.ts

import { useEntitySave } from "../../shared/crud-hooks";
import { clientesApi } from "../api/clientesApi";
import type {
  AtualizarClienteInput,
  Cliente,
  CriarClienteInput,
} from "../tipos";

type Params = {
  mode: "create" | "edit";
  clienteId?: string;
  onSuccess?: (cliente: Cliente) => void | Promise<void>;
};

export function useSalvarCliente({ mode, clienteId, onSuccess }: Params) {
  return useEntitySave<CriarClienteInput, AtualizarClienteInput, Cliente>({
    mode,
    id: clienteId,
    invalidIdMessage: "Cliente inválido.",
    create: clientesApi.criar,
    update: clientesApi.atualizar,
    onSuccess,
  });
}
