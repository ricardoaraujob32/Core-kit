// packages/core/src/clientes/tipos.ts
// Finalidade: Tipos do domínio de Clientes (somente tipos).

import type { LocatarioId } from "../locatario";

export type ClienteId = string;

export type StatusCliente = "ATIVO" | "INATIVO";

export type Cliente = {
  id: ClienteId;
  locatarioId: LocatarioId;
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string // CPF/CNPJ
  status: StatusCliente;
  criadoEm: Date;
  atualizadoEm: Date;
  deletadoEm?: Date;
};

export type NovoCliente = {
  locatarioId: LocatarioId;
  nome: string;
  email?: string;
};
