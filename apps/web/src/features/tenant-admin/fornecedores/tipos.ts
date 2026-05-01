// apps/web/src/features/tenant-admin/fornecedores/tipos.ts

export type Fornecedor = {
  fornecedorId: string;
  locatarioId: string;
  nome: string;
  documento: string | null;
  email?: string | null;
  telefone?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
  excluidoEm?: string | null;
};

export type ListarFornecedoresResponse = {
  itens: Fornecedor[];
};

export type ObterFornecedorResponse = {
  item: Fornecedor;
};

export type CriarFornecedorInput = {
  nome: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
};

export type CriarFornecedorResponse = {
  item: Fornecedor;
};

export type AtualizarFornecedorInput = {
  nome?: string;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
};

export type AtualizarFornecedorResponse = {
  item: Fornecedor;
};

export type ExcluirFornecedorResponse = {
  item?: Fornecedor;
  sucesso?: boolean;
};