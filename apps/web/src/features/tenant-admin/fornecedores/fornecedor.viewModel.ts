// apps/web/src/features/tenant-admin/fornecedores/fornecedor.viewModel.ts

import type { TenantViewModel } from "../../../shared/tenantViewModel";
import { fallbackTexto } from "../../../shared/tenantViewModel";

export type FornecedorViewModelInput = {
  fornecedorId: string;
  nome?: string | null;
  documento?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  status?: string | null;
};

function primeiroContato(fornecedor: FornecedorViewModelInput): string {
  const documento = fornecedor.documento ?? fornecedor.cpf ?? fornecedor.cnpj;

  if (documento) return `Documento: ${documento}`;
  if (fornecedor.telefone) return `Telefone: ${fornecedor.telefone}`;
  if (fornecedor.email) return `E-mail: ${fornecedor.email}`;

  return "Sem contato informado";
}

export function toFornecedorViewModel(
  fornecedor: FornecedorViewModelInput,
): TenantViewModel {
  return {
    key: fornecedor.fornecedorId,
    titulo: fallbackTexto(fornecedor.nome, "Fornecedor sem nome"),
    subtitulo: primeiroContato(fornecedor),
    status: fornecedor.status ?? undefined,
  };
}
