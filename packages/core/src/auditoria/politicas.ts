// packages/core/src/auditoria/politicas.ts

import type { Result, ErroApp } from "../kernel";
import type { LocatarioId } from "../locatarios";
import type { UsuarioId } from "../usuarios";
import type { CategoriaAuditoria } from "./tipos";

export type OperacaoPoliticaAuditoria =
  | "AUDITORIA_LOCATARIO_REGISTRAR"
  | "AUDITORIA_LOCATARIO_LISTAR"
  | "AUDITORIA_PLATAFORMA_REGISTRAR"
  | "AUDITORIA_PLATAFORMA_LISTAR";

export type EntradaPoliticaAuditoria = {
  operacao: OperacaoPoliticaAuditoria;
  locatarioId?: LocatarioId | null;
  locatarioAlvoId?: LocatarioId | null;
  usuarioId?: UsuarioId | null;
  superadminUsuarioId?: UsuarioId | null;
  categoria?: CategoriaAuditoria | null;
  evento?: string | null;
  dados?: Record<string, unknown>;
};

export type PoliticaSegurancaAuditoriaPorta = {
  autorizar(input: EntradaPoliticaAuditoria): Promise<Result<void, ErroApp>>;
};

export type DepsPoliticaSegurancaAuditoria = {
  politicaSeguranca?: PoliticaSegurancaAuditoriaPorta;
};

export async function autorizarAuditoria(
  deps: DepsPoliticaSegurancaAuditoria,
  input: EntradaPoliticaAuditoria,
): Promise<Result<void, ErroApp> | null> {
  if (!deps.politicaSeguranca) return null;
  return deps.politicaSeguranca.autorizar(input);
}