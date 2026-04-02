// packages/core/src/locatarios/tipos.ts

import type { ErroApp, Result } from "../kernel";

/**
 * Identificador lógico de um locatário.
 *
 * Representa a fronteira principal de isolamento multi-tenant do sistema.
 * Deve ser tratado como identidade estável do locatário em regras de domínio,
 * autorização, auditoria e persistência.
 */
export type LocatarioId = string;

/**
 * Identificador único usado pelo usuário final
 */
export type LocatarioSlug = string;

/**
 * Estados possíveis do ciclo de vida de um locatário.
 *
 * - `ATIVO`: locatário operacional e apto a usar o sistema.
 * - `SUSPENSO`: locatário temporariamente impedido de operar.
 * - `EXCLUIDO`: locatário excluído do ponto de vista de negócio.
 */
export type LocatarioStatus =
  | "ATIVO"
  | "SUSPENSO"
  | "EXCLUIDO";

/**
 * Eventos formais da máquina de estados de locatários.
 */
export type EventoLocatario =
  | "OPERAR"
  | "SUSPENDER"
  | "REATIVAR"
  | "ENCERRAR";
/**
 * Entidade de domínio que representa um locatário da plataforma.
 *
 * Este tipo modela apenas a visão do Core. Não deve ser confundido com a
 * estrutura física do banco de dados nem com payloads HTTP.
 */
export interface Locatario {
  /** Identificador único do locatário. */
  locatarioId: LocatarioId;
  /** Nome exibível do locatário. */
  nome: string;
  /** Estado atual do locatário. */
  status: LocatarioStatus;
  /** Data de criação do locatário no domínio. */
  criadoEm: Date;
}

/**
 * Dados mínimos necessários para criar um locatário.
 */
export interface CriarLocatarioInput {
  /** Nome do novo locatário. */
  nome: string;
}

/**
 * Resultado essencial retornado após a criação de um locatário.
 */
export interface CriarLocatarioOutput {
  /** Identificador atribuído ao locatário recém-criado. */
  locatarioId: LocatarioId;
}

/**
 * Resultado assíncrono da criação de locatário.
 */
export type CriarLocatarioResult = Promise<Result<CriarLocatarioOutput, ErroApp>>;

/**
 * Entrada da listagem de locatários.
 *
 * Mantida como objeto vazio para padronização do contrato.
 */
export interface ListarLocatariosInput {}

/**
 * Saída padronizada para listagem de locatários.
 */
export interface ListarLocatariosOutput {
  /** Coleção de locatários retornados pela operação. */
  itens: Locatario[];
}

/**
 * Resultado assíncrono da listagem de locatários.
 */
export type ListarLocatariosResult = Promise<Result<ListarLocatariosOutput, ErroApp>>;

/**
 * Entrada usada para buscar um locatário específico por identidade.
 */
export interface ObterLocatarioInput {
  /** Identificador do locatário a ser obtido. */
  locatarioId: LocatarioId;
}

/**
 * Saída da obtenção de locatário.
 */
export interface ObterLocatarioOutput {
  locatario: Locatario;
}

/**
 * Resultado assíncrono da obtenção de um locatário.
 */
export type ObterLocatarioResult = Promise<Result<ObterLocatarioOutput, ErroApp>>;
