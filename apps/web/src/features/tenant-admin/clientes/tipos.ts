// apps/web/src/features/tenant-admin/clientes/tipos.ts

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

export type CriarClienteResponse = {
  item: Cliente;
};

export type AtualizarClienteResponse = {
  item: Cliente;
};

export type ExcluirClienteResponse = void;

export type CriarClienteInput = {
  nome: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
};

export type AtualizarClienteInput = Partial<CriarClienteInput>;