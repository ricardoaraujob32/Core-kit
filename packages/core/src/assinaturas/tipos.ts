// packages/core/src/assinaturas/tipos.ts

import { LocatarioId } from "../locatarios";
import { ModuloId } from "../modulos"

export type AssinaturaId = string;
export type PlanoId = string;

export type StatusAssinatura =
  | "RASCUNHO"
  | "ATIVA"
  | "SUSPENSA"
  | "CANCELADA"
  | "ENCERRADA";

export interface Assinatura {
  assinaturaId: AssinaturaId;
  locatarioId: LocatarioId;
  planoId: PlanoId;
  status: StatusAssinatura;
  iniciadaEm: Date;
  encerradaEm: Date | null;
  criadaEm: Date;
  atualizadaEm: Date;
}

export interface ModuloHabilitadoAssinatura {
  assinaturaId: AssinaturaId;
  moduloId: ModuloId;
  gratuito: boolean;
  origem: "ASSINATURA" | "GRATUITO";
  habilitadoEm: Date;
  desabilitadoEm: Date | null;
}

export interface CriarAssinaturaInput {
  locatarioId: LocatarioId;
  planoId: PlanoId;
  iniciadaEm?: Date;
}

export interface CriarAssinaturaOutput {
  assinatura: Assinatura;
}

export interface AtivarAssinaturaInput {
  assinaturaId: AssinaturaId;
}

export interface SuspenderAssinaturaInput {
  assinaturaId: AssinaturaId;
  motivo?: string | null;
}

export interface CancelarAssinaturaInput {
  assinaturaId: AssinaturaId;
  encerradaEm?: Date;
  motivo?: string | null;
}

export interface VincularModuloNaAssinaturaInput {
  assinaturaId: AssinaturaId;
  moduloId: ModuloId;
}

export interface DesvincularModuloDaAssinaturaInput {
  assinaturaId: AssinaturaId;
  moduloId: ModuloId;
}

export interface ListarModulosHabilitadosLocatarioInput {
  locatarioId: LocatarioId;
}

export interface ModuloHabilitadoLocatario {
  moduloId: ModuloId;
  origem: "ASSINATURA" | "GRATUITO";
  gratuito: boolean;
}

export interface ListarModulosHabilitadosLocatarioOutput {
  locatarioId: LocatarioId;
  assinaturaAtiva: Assinatura | null;
  modulos: ModuloHabilitadoLocatario[];
}

export interface RegistrarAssinaturaParams {
  assinaturaId?: AssinaturaId;
  locatarioId: LocatarioId;
  planoId: PlanoId;
  status: StatusAssinatura;
  iniciadaEm: Date;
  encerradaEm?: Date | null;
  criadaEm: Date;
  atualizadaEm: Date;
}

export interface RegistrarModuloAssinaturaParams {
  assinaturaId: AssinaturaId;
  moduloId: ModuloId;
  gratuito: boolean;
  origem: "ASSINATURA" | "GRATUITO";
  habilitadoEm: Date;
  desabilitadoEm?: Date | null;
}

export interface ListarModulosGratisResult {
  moduloId: ModuloId;
}

export interface ValidarPlanoAtivoResult {
  planoId: PlanoId;
  ativo: boolean;
}

export interface ValidarModuloExistenteResult {
  moduloId: ModuloId;
  ativo: boolean;
}