// packages/core/src/locatarios/tipos.ts

import { ErroApp } from "../erros";
import { Result } from "../result";

/**
 * IDs (por enquanto string; você pode evoluir para branded type depois).
 * "Locatário" é a empresa/cliente dono do contexto.
 */
export type LocatarioId = string;

export type LocatarioStatus = "ATIVO" | "SUSPENSO" | "ENCERRADO";

export type Locatario = {
  locatarioId: LocatarioId;
  nome: string;
  status: LocatarioStatus;
  criadoEm: Date;
};

export type CriarLocatarioInput = {
  nome: string;
  // ctx: ContextoExecucao (modo plataforma) — opcional nesta fase se o handler já garantir
};

export type CriarLocatarioOutput = {
  locatarioId: LocatarioId;
};

export type ListarLocatariosOutput = {
  itens: Locatario[];
};

export type ObterLocatarioInput = {
  locatarioId: LocatarioId;
};

export type ResultadoObterLocatario = Promise<Result<Locatario, ErroApp>>;

export type ResultadoCriarLocatario = Promise<
  Result<CriarLocatarioOutput, ErroApp>
>;

export type ResultadoListarLocatarios = Promise<
  Result<ListarLocatariosOutput, ErroApp>
>;