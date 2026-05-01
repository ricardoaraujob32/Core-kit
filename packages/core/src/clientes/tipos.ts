// packages/core/src/clientes/tipos.ts

import type { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

export type ClienteId = string;
export type ClienteStatus = "ATIVO" | "INATIVO" | "EXCLUIDO";

export type Cliente = {
  clienteId: ClienteId;
  locatarioId: LocatarioId;
  nome: string;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  status: ClienteStatus;
  criadoEm: Date;
  atualizadoEm: Date;
  excluidoEm: Date | null;
  excluidoPor: UsuarioId | null;
  excluidoMotivo: string | null;
};

export type CriarClienteInput = { locatarioId: LocatarioId; nome: string; documento?: string | null; email?: string | null; telefone?: string | null };
export type CriarClienteOutput = { clienteId: ClienteId };
export type CriarClienteResult = Promise<Result<CriarClienteOutput, ErroApp>>;

export type ObterClienteInput = { locatarioId: LocatarioId; clienteId: ClienteId };
export type ObterClienteOutput = { cliente: Cliente };
export type ObterClienteResult = Promise<Result<ObterClienteOutput, ErroApp>>;

export type ListarClientesInput = { locatarioId: LocatarioId; cursor?: ClienteId; limite?: number };
export type ListarClientesOutput = { itens: Cliente[] };
export type ListarClientesResult = Promise<Result<ListarClientesOutput, ErroApp>>;

export type AtualizarClienteInput = { locatarioId: LocatarioId; clienteId: ClienteId; nome?: string; documento?: string | null; email?: string | null; telefone?: string | null };
export type AtualizarClienteOutput = { cliente: Cliente };
export type AtualizarClienteResult = Promise<Result<AtualizarClienteOutput, ErroApp>>;

export type InativarClienteInput = { locatarioId: LocatarioId; clienteId: ClienteId };
export type InativarClienteOutput = { cliente: Cliente };
export type InativarClienteResult = Promise<Result<InativarClienteOutput, ErroApp>>;

export type ReativarClienteInput = { locatarioId: LocatarioId; clienteId: ClienteId };
export type ReativarClienteOutput = { cliente: Cliente };
export type ReativarClienteResult = Promise<Result<ReativarClienteOutput, ErroApp>>;

export type ExcluirClienteInput = { locatarioId: LocatarioId; clienteId: ClienteId; excluidoPor?: string; excluidoMotivo?: string };
export type ExcluirClienteOutput = { cliente: Cliente; }; 
export type ExcluirClienteResult = Promise<Result<ExcluirClienteOutput, ErroApp>>;