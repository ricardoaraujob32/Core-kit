// apps/web/src/features/tenant-admin/clientes/tipos.ts

export type CriarClienteInput = {
  nome: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
};

export type CriarClienteResponse = {
  clienteId?: string;
  locatarioId?: string;
  nome?: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
  criadoEm?: string;
};

export type Cliente = {
  clienteId: string;
  locatarioId: string;
  nome: string;
  documento: string | null;
  email?: string | null;
  telefone?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
  excluidoEm?: string | null;
};

export type ListarClientesResponse = {
  itens: Cliente[];
};

export type ObterClienteResponse = {
  item: Cliente;
};

export type AtualizarClienteInput = {
  nome?: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
};

export type AtualizarClienteResponse = {
  item: Cliente;
};

export type ExcluirClienteResponse = {
  item?: Cliente;
  sucesso?: boolean;
};