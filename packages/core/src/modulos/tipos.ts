// packages/core/src/modulos/tipos.ts

import { ContextoExecucao, ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";

/**
 * Código lógico de um módulo funcional do sistema.
 *
 * É a identidade estável usada em regras de habilitação, assinatura e checagens de acesso.
 */
export type ModuloCodigo = string;

/**
 * Identificador interno de um módulo persistido.
 */
export type ModuloId = string;

/**
 * Origem pela qual um módulo foi habilitado para um locatário.
 *
 * - `SISTEMA`: habilitação nativa da plataforma.
 * - `PLANO`: habilitação decorrente de assinatura/plano.
 * - `MANUAL`: habilitação operacional ou administrativa.
 */
export type OrigemModuloHabilitado = "SISTEMA" | "PLANO" | "MANUAL";

/**
 * Representa um módulo habilitado para uso no contexto de um locatário.
 */
export type ModuloHabilitado = {
  /** Código lógico do módulo habilitado. */
  codigo: ModuloCodigo;
  /** Origem da habilitação do módulo. */
  origem: OrigemModuloHabilitado;
};

/**
 * Entrada da operação que lista módulos habilitados de um locatário.
 */
export interface ListarModulosHabilitadosInput {
  /** Locatário alvo da consulta. */
  locatarioId: LocatarioId;
};

/**
 * Saída da listagem de módulos habilitados.
 */
export interface ListarModulosHabilitadosOutput {
  /** Locatário consultado. */
  locatarioId: LocatarioId;
  /** Módulos reconhecidos como habilitados. */
  modulos: ModuloHabilitado[];
};

/**
 * retorno padronizado de módulos habilitados
 */
export type ListarModulosHabilitadosResult = Promise<Result<ListarModulosHabilitadosOutput, ErroApp>>;

/**
 * Entrada da operação que verifica se um módulo específico está habilitado.
 */
export type ModuloEstaHabilitadoInput = {
  /** Locatário no qual a checagem será feita. */
  locatarioId: LocatarioId;
  /** Código do módulo a verificar. */
  codigo: ModuloCodigo;
};

/**
 * Saída da operação que verifica habilitação de módulo.
 */
export type ModuloEstaHabilitadoOutput = {
  /** Locatário consultado. */
  locatarioId: LocatarioId;
  /** Código do módulo verificado. */
  codigo: ModuloCodigo;
  /** Indica se o módulo está habilitado. */
  habilitado: boolean;
  /** Origem da habilitação, quando o módulo estiver habilitado. */
  origem?: OrigemModuloHabilitado;
};

/**
 * 
 */
export type ModuloEstaHabilitadoResult = Promise<Result<ModuloEstaHabilitadoOutput, ErroApp>>;

/**
 * 
 */
export type ResolverModulosHabilitadosInput = {
  ctx: ContextoExecucao;
};

/**
 * 
 */
export type ResolverModulosHabilitadosOutput = {
  ctx: ContextoExecucao;
  modulos: ModuloHabilitado[];
};

/**
 * 
 */
export type ResolverModulosHabilitadosResult = Promise<Result<ResolverModulosHabilitadosOutput, ErroApp>>;
