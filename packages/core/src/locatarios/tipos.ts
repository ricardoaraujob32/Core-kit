// packages/core/src/locatarios/tipos.ts

import type { ErroApp } from "../erros";
import type { Result } from "../result";

export type LocatarioId = string;

export type LocatarioStatus =
  | "ATIVO"
  | "SUSPENSO"
  | "ENCERRADO";

export interface Locatario {
  locatarioId: LocatarioId;
  nome: string;
  status: LocatarioStatus;
  criadoEm: Date;
}

export interface CriarLocatarioInput {
  nome: string;
}

export interface CriarLocatarioOutput {
  locatarioId: LocatarioId;
}

export interface ListarLocatariosOutput {
  itens: Locatario[];
}

export interface ObterLocatarioInput {
  locatarioId: LocatarioId;
}

export type ResultadoCriarLocatario = Promise< Result<CriarLocatarioOutput, ErroApp> >;

export type ResultadoListarLocatarios = Promise< Result<ListarLocatariosOutput, ErroApp> >;

export type ResultadoObterLocatario = Promise< Result<Locatario, ErroApp> >;