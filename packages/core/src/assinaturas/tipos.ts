// packages/core/src/assinaturas/tipos.ts

import { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import { ModuloId } from "../modulos/index.js";

/**
 * Identificador lógico de uma assinatura.
 */
export type AssinaturaId = string;

/**
 * Identificador lógico de um plano comercial.
 */
export type PlanoId = string;

/**
 * Estados possíveis do ciclo de vida de uma assinatura.
 */
export type StatusAssinatura =
  | "RASCUNHO"
  | "ATIVA"
  | "SUSPENSA"
  | "CANCELADA"
  | "ENCERRADA";

/**
 * Eventos formais da máquina de estados da assinatura.
 */
export type EventoAssinatura =
  | "CRIAR"
  | "ATIVAR"
  | "SUSPENDER"
  | "CANCELAR"
  | "ENCERRAR";

/**
 * Entidade de domínio que representa a assinatura vigente ou histórica de um locatário.
 */
export interface Assinatura {
  /** Identificador da assinatura. */
  assinaturaId: AssinaturaId;
  /** Locatário titular da assinatura. */
  locatarioId: LocatarioId;
  /** Plano comercial associado. */
  planoId: PlanoId;
  /** Estado atual da assinatura. */
  status: StatusAssinatura;
  /** Data/hora de início da assinatura. */
  iniciadaEm: Date;
  /** Data/hora de encerramento, quando houver. */
  encerradaEm: Date | null;
  /** Data/hora de criação do registro. */
  criadaEm: Date;
  /** Data/hora da última atualização. */
  atualizadaEm: Date;
}

/**
 * Vínculo entre assinatura e módulo habilitado por ela.
 */
export interface ModuloHabilitadoAssinatura {
  /** Assinatura que habilita o módulo. */
  assinaturaId: AssinaturaId;
  /** Módulo habilitado. */
  moduloId: ModuloId;
  /** Indica se o módulo foi concedido gratuitamente. */
  gratuito: boolean;
  /** Origem específica da concessão dentro do contexto da assinatura. */
  origem: "ASSINATURA" | "GRATUITO";
  /** Data/hora em que o módulo foi habilitado. */
  habilitadoEm: Date;
  /** Data/hora em que o módulo foi desabilitado, quando aplicável. */
  desabilitadoEm: Date | null;
}

/**
 * Entrada para ativar uma assinatura.
 */
export interface AtivarAssinaturaInput {
  /** Assinatura a ser ativada. */
  assinaturaId: AssinaturaId;
}

/**
 * Saída da ativação de assinatura.
 */
export interface AtivarAssinaturaOutput {
  assinatura: Assinatura;
}

/**
 * Resultado da ativação de assinatura.
 */
export type AtivarAssinaturaResult = Promise<Result<AtivarAssinaturaOutput, ErroApp>>;

/**
 * Entrada para cancelar uma assinatura.
 */
export interface CancelarAssinaturaInput {
  /** Assinatura a ser cancelada. */
  assinaturaId: AssinaturaId;
  /** Data de encerramento efetiva, quando explicitada. */
  encerradaEm?: Date;
  /** Motivo opcional do cancelamento. */
  motivo?: string | null;
}

/**
 * Saída do cancelamento de assinatura.
 */
export interface CancelarAssinaturaOutput {
  assinatura: Assinatura;
}

/**
 * Resultado do cancelamento de assinatura.
 */
export type CancelarAssinaturaResult = Promise<Result<CancelarAssinaturaOutput, ErroApp>>;

/**
 * Entrada para criação de uma nova assinatura.
 */
export interface CriarAssinaturaInput {
  /** Locatário que receberá a assinatura. */
  locatarioId: LocatarioId;
  /** Plano a ser associado. */
  planoId: PlanoId;
  /** Data de início opcional; se omitida, a operação pode usar o relógio atual. */
  iniciadaEm?: Date;
}

/**
 * Saída da criação de assinatura.
 */
export interface CriarAssinaturaOutput {
  /** Assinatura criada. */
  assinatura: Assinatura;
}

/**
 * Resultado da criação de assinatura.
 */
export type CriarAssinaturaResult = Promise<Result<CriarAssinaturaOutput, ErroApp>>;

/**
 * Entrada para desvincular um módulo de uma assinatura.
 */
export interface DesvincularModuloDaAssinaturaInput {
  /** Assinatura alvo. */
  assinaturaId: AssinaturaId;
  /** Módulo a ser desvinculado. */
  moduloId: ModuloId;
}

/**
 * Saída do desvínculo de módulo na assinatura.
 */
export interface DesvincularModuloDaAssinaturaOutput {
  assinaturaId: AssinaturaId;
  moduloId: ModuloId;
  desabilitadoEm: Date;
}

/**
 * Resultado do desvínculo de módulo na assinatura.
 */
export type DesvincularModuloDaAssinaturaResult = Promise<Result<DesvincularModuloDaAssinaturaOutput, ErroApp>>;

/**
 * Entrada para listar módulos habilitados para um locatário no contexto de assinaturas.
 */
export interface ListarModulosHabilitadosLocatarioInput {
  /** Locatário consultado. */
  locatarioId: LocatarioId;
}

/**
 * Saída da listagem consolidada de módulos habilitados do locatário.
 */
export interface ListarModulosHabilitadosLocatarioOutput {
  /** Locatário consultado. */
  locatarioId: LocatarioId;
  /** Assinatura ativa, se existir. */
  assinaturaAtiva: Assinatura | null;
  /** Módulos habilitados para o locatário. */
  modulos: ModuloHabilitadoLocatario[];
}

/**
 * Resultado da listagem de módulos habilitados do locatário.
 */
export type ListarModulosHabilitadosLocatarioResult = Promise<Result<ListarModulosHabilitadosLocatarioOutput, ErroApp>>;

/**
 * Entrada para suspender uma assinatura.
 */
export interface SuspenderAssinaturaInput {
  /** Assinatura a ser suspensa. */
  assinaturaId: AssinaturaId;
  /** Motivo opcional da suspensão. */
  motivo?: string | null;
}

/**
 * Saída da suspensão de assinatura.
 */
export interface SuspenderAssinaturaOutput {
  assinatura: Assinatura;
}

/**
 * Resultado da suspensão de assinatura.
 */
export type SuspenderAssinaturaResult = Promise<Result<SuspenderAssinaturaOutput, ErroApp>>;

/**
 * Entrada para vincular um módulo a uma assinatura.
 */
export interface VincularModuloNaAssinaturaInput {
  /** Assinatura alvo. */
  assinaturaId: AssinaturaId;
  /** Módulo a ser vinculado. */
  moduloId: ModuloId;
}

/**
 * Saída do vínculo de módulo na assinatura.
 */
export interface VincularModuloNaAssinaturaOutput {
  assinaturaId: AssinaturaId;
  moduloId: ModuloId;
  habilitadoEm: Date;
  origem: "ASSINATURA";
  gratuito: false;
}

/**
 * Resultado do vínculo de módulo na assinatura.
 */
export type VincularModuloNaAssinaturaResult = Promise<Result<VincularModuloNaAssinaturaOutput, ErroApp>>;

/**
 * Visão consolidada de um módulo habilitado para o locatário.
 */
export interface ModuloHabilitadoLocatario {
  /** Módulo habilitado. */
  moduloId: ModuloId;
  /** Origem da habilitação no contexto da assinatura. */
  origem: "ASSINATURA" | "GRATUITO";
  /** Indica se a habilitação é gratuita. */
  gratuito: boolean;
}

/**
 * Parâmetros internos de registro/persistência de assinatura.
 *
 * Útil para portas de repositório e adaptadores de infra.
 */
export interface RegistrarAssinaturaParams {
  /** Identificador opcional para casos de reidratação ou persistência controlada. */
  assinaturaId?: AssinaturaId;
  /** Locatário titular da assinatura. */
  locatarioId: LocatarioId;
  /** Plano vinculado à assinatura. */
  planoId: PlanoId;
  /** Estado da assinatura no momento do registro. */
  status: StatusAssinatura;
  /** Data de início da assinatura. */
  iniciadaEm: Date;
  /** Data de encerramento, quando houver. */
  encerradaEm?: Date | null;
  /** Data de criação do registro. */
  criadaEm: Date;
  /** Data de atualização do registro. */
  atualizadaEm: Date;
}

/**
 * Entrada para vincular um módulo a uma assinatura.
 */
export interface RegistrarModuloAssinaturaParams {
  assinaturaId: AssinaturaId;
  moduloId: ModuloId;
  gratuito: boolean;
  origem: "ASSINATURA" | "GRATUITO";
  habilitadoEm: Date;
  desabilitadoEm?: Date | null;
}

/**
 * Retorno para listar todos os módulos grátis
 */
export interface ListarModulosGratisResult {
  moduloId: ModuloId;
}

/**
 * Retorno para validar o plano ativo
 */
export interface ValidarPlanoAtivoResult {
  planoId: PlanoId;
  ativo: boolean;
}

/**
 * Retorno para validar módulos existentes
 */
export interface ValidarModuloExistenteResult {
  moduloId: ModuloId;
  ativo: boolean;
}
