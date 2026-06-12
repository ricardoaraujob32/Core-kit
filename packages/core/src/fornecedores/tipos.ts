// packages/core/src/fornecedores/tipos.ts

import type { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

export type FornecedorId = string;
export type FornecedorStatus = "ATIVO" | "INATIVO" | "EXCLUIDO";

export type Fornecedor = {
  fornecedorId: FornecedorId;
  locatarioId: LocatarioId;
  nome: string;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  status: FornecedorStatus;
  criadoEm: Date;
  atualizadoEm: Date;
  excluidoEm: Date | null;
  excluidoPor: UsuarioId | null;
  excluidoMotivo: string | null;
};

export type CriarFornecedorInput = { locatarioId: LocatarioId; nome: string; documento?: string | null; email?: string | null; telefone?: string | null };
export type CriarFornecedorOutput = { fornecedorId: FornecedorId };
export type CriarFornecedorResult = Promise<Result<CriarFornecedorOutput, ErroApp>>;

export type ObterFornecedorInput = { locatarioId: LocatarioId; fornecedorId: FornecedorId };
export type ObterFornecedorOutput = { fornecedor: Fornecedor };
export type ObterFornecedorResult = Promise<Result<ObterFornecedorOutput, ErroApp>>;

export type ListarFornecedorsInput = { locatarioId: LocatarioId; cursor?: FornecedorId; limite?: number };
export type ListarFornecedorsOutput = { itens: Fornecedor[] };
export type ListarFornecedorsResult = Promise<Result<ListarFornecedorsOutput, ErroApp>>;

export type AtualizarFornecedorInput = { locatarioId: LocatarioId; fornecedorId: FornecedorId; nome?: string; documento?: string | null; email?: string | null; telefone?: string | null };
export type AtualizarFornecedorOutput = { fornecedor: Fornecedor };
export type AtualizarFornecedorResult = Promise<Result<AtualizarFornecedorOutput, ErroApp>>;

export type InativarFornecedorInput = { locatarioId: LocatarioId; fornecedorId: FornecedorId };
export type InativarFornecedorOutput = { fornecedor: Fornecedor };
export type InativarFornecedorResult = Promise<Result<InativarFornecedorOutput, ErroApp>>;

export type ReativarFornecedorInput = { locatarioId: LocatarioId; fornecedorId: FornecedorId };
export type ReativarFornecedorOutput = { fornecedor: Fornecedor };
export type ReativarFornecedorResult = Promise<Result<ReativarFornecedorOutput, ErroApp>>;

export type ExcluirFornecedorInput = {
  locatarioId: LocatarioId;
  fornecedorId: FornecedorId;
  excluidoPor?: string | null;
  excluidoMotivo?: string | null;
};

export type ExcluirFornecedorOutput = {
  fornecedor: Fornecedor;
};

export type ExcluirFornecedorResult = Promise<Result<ExcluirFornecedorOutput, ErroApp>>;
