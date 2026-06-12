// packages/core/src/locatarios/politicas.ts

import type { Result, ErroApp } from "../kernel/index.js";
import type { Locatario, LocatarioId } from "./tipos.js";

/**
 * 
 */
export type OperacaoPoliticaLocatario =
  | "LOCATARIO_CRIAR"
  | "LOCATARIO_LISTAR"
  | "LOCATARIO_OBTER"
  | "LOCATARIO_ATUALIZAR"
  | "LOCATARIO_SUSPENDER"
  | "LOCATARIO_REATIVAR"
  | "LOCATARIO_ENCERRAR"
  | "LOCATARIO_CONFIGURACAO_CRIAR"
  | "LOCATARIO_CONFIGURACAO_ATUALIZAR"
  | "LOCATARIO_CONFIGURACAO_ATIVAR";

/**
 * 
 */  
export type EntradaPoliticaLocatario = {
  operacao: OperacaoPoliticaLocatario;
  locatarioId?: LocatarioId | null;
  locatario?: Locatario | null;
  dados?: Record<string, unknown>;
};

/**
 * 
 */
export type PoliticaSegurancaLocatariosPorta = {
  autorizar(input: EntradaPoliticaLocatario): Promise<Result<void, ErroApp>>;
};

/**
 * 
 */
export type DepsPoliticaLocatario = {
  politicaSeguranca?: PoliticaSegurancaLocatariosPorta;
};

/**
 * 
 * @param deps 
 * @param input 
 * @returns 
 */
export async function autorizarLocatario(deps: DepsPoliticaLocatario, input: EntradaPoliticaLocatario): Promise<Result<void, ErroApp> | null> {
  if (!deps.politicaSeguranca) return null;
  return deps.politicaSeguranca.autorizar(input);
}
