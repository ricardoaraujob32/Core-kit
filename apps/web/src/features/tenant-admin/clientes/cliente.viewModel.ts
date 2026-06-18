// apps/web/src/features/tenant-admin/clientes/cliente.viewModel.ts

import type { TenantViewModel } from "../../../shared/tenantViewModel";
import { fallbackTexto } from "../../../shared/tenantViewModel";

export type ClienteViewModelInput = {
  clienteId: string;
  nome?: string | null;
  documento?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  status?: string | null;
};

function primeiroContato(cliente: ClienteViewModelInput): string {
  const documento = cliente.documento ?? cliente.cpf ?? cliente.cnpj;

  if (documento) return `Documento: ${documento}`;
  if (cliente.telefone) return `Telefone: ${cliente.telefone}`;
  if (cliente.email) return `E-mail: ${cliente.email}`;

  return "Sem contato informado";
}

export function toClienteViewModel(
  cliente: ClienteViewModelInput,
): TenantViewModel {
  return {
    key: cliente.clienteId,
    titulo: fallbackTexto(cliente.nome, "Cliente sem nome"),
    subtitulo: primeiroContato(cliente),
    status: cliente.status ?? undefined,
  };
}
