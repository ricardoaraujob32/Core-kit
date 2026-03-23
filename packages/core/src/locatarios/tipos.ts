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
 * Estados possíveis do ciclo de vida de um locatário.
 *
 * - `ATIVO`: locatário operacional e apto a usar o sistema.
 * - `SUSPENSO`: locatário temporariamente impedido de operar.
 * - `ENCERRADO`: locatário encerrado do ponto de vista de negócio.
 */
export type LocatarioStatus =
  | "ATIVO"
  | "SUSPENSO"
  | "ENCERRADO";

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
 * Saída padronizada para listagem de locatários.
 */
export interface ListarLocatariosOutput {
  /** Coleção de locatários retornados pela operação. */
  itens: Locatario[];
}

/**
 * Entrada usada para buscar um locatário específico por identidade.
 */
export interface ObterLocatarioInput {
  /** Identificador do locatário a ser obtido. */
  locatarioId: LocatarioId;
}

/**
 * Resultado assíncrono da criação de locatário.
 */
export type ResultadoCriarLocatario = Promise<Result<CriarLocatarioOutput, ErroApp>>;

/**
 * Resultado assíncrono da listagem de locatários.
 */
export type ResultadoListarLocatarios = Promise<Result<ListarLocatariosOutput, ErroApp>>;

/**
 * Resultado assíncrono da obtenção de um locatário.
 */
export type ResultadoObterLocatario = Promise<Result<Locatario, ErroApp>>;
