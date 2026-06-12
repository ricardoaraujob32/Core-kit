// packages/core/src/assinaturas/politicas.ts

import type { Result, ErroApp } from "../kernel/index.js";
import type { LocatarioId } from "../locatarios/index.js";
import type { Assinatura, AssinaturaId, PlanoId } from "./tipos.js";
import type { ModuloId } from "../modulos/index.js";

export type OperacaoPoliticaAssinatura =
  | "ASSINATURA_CRIAR"
  | "ASSINATURA_ATIVAR"
  | "ASSINATURA_SUSPENDER"
  | "ASSINATURA_CANCELAR"
  | "ASSINATURA_VINCULAR_MODULO"
  | "ASSINATURA_DESVINCULAR_MODULO"
  | "ASSINATURA_LISTAR_MODULOS";

export type EntradaPoliticaAssinatura = {
  operacao: OperacaoPoliticaAssinatura;
  locatarioId?: LocatarioId | null;
  assinaturaId?: AssinaturaId | null;
  planoId?: PlanoId | null;
  moduloId?: ModuloId | null;
  assinatura?: Assinatura | null;
  dados?: Record<string, unknown>;
};

export type PoliticaSegurancaAssinaturasPorta = {
  autorizar(input: EntradaPoliticaAssinatura): Promise<Result<void, ErroApp>>;
};

export type DepsPoliticaSegurancaAssinaturas = {
  politicaSeguranca?: PoliticaSegurancaAssinaturasPorta;
};

export async function autorizarAssinatura(deps: DepsPoliticaSegurancaAssinaturas, input: EntradaPoliticaAssinatura): Promise<Result<void, ErroApp> | null> {
  if (!deps.politicaSeguranca) return null;
  return deps.politicaSeguranca.autorizar(input);
}