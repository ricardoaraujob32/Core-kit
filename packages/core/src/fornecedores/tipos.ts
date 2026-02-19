// packages/core/src/fornecedores/tipos.ts
// Finalidade: Tipos do domínio de Fornecedores (somente tipos).

import type { LocatarioId } from "../locatario";

export type FornecedorId = string;

export type StatusFornecedor = "ATIVO" | "INATIVO";

export type Fornecedor = {
  id: FornecedorId;
  locatarioId: LocatarioId;
  nome: string;
  email?: string;
  status: StatusFornecedor;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type NovoFornecedor = {
  locatarioId: LocatarioId;
  nome: string;
  email?: string;
};
