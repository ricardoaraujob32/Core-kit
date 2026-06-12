// packages/core/src/exportacoes/tipos.ts

import { StatusJob } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import { UsuarioId } from "../usuarios/index.js";

/**
 * Identificador lógico de uma exportação.
 */
export type ExportacaoId = string;

/**
 * Formatos de saída atualmente reconhecidos pelo domínio de exportações.
 */
export type FormatoExportacao = "CSV" | "XLSX" | "JSON" | "PDF";

/**
 * Entidade de domínio que representa uma exportação solicitada.
 *
 * No esquema v16, exportações também servem como base para backup lógico
 * de locatário em operações especializadas.
 */
export interface Exportacao {
  /** Identificador da exportação. */
  exportacaoId: ExportacaoId;
  /** Locatário ao qual a exportação pertence. */
  locatarioId: LocatarioId;
  /** Usuário que solicitou a exportação, quando identificado. */
  criadoPorUsuarioId: UsuarioId | null;
  /** Formato do artefato solicitado. */
  formato: FormatoExportacao;
  /** Estado atual do job. */
  status: StatusJob;
  /** Parâmetros livres que qualificam a exportação. */
  parametros: Record<string, unknown>;
  /** Referência ao resultado gerado, quando concluído. */
  referenciaResultado: string | null;
  /** Mensagem de erro, quando houver falha. */
  mensagemErro: string | null;
  /** Data/hora de criação do registro. */
  criadoEm: Date;
  /** Data/hora da última atualização do registro. */
  atualizadoEm: Date;
}

/**
 * Entrada para solicitar uma nova exportação.
 */
export interface SolicitarExportacaoInput {
  /** Locatário dono da exportação. */
  locatarioId: LocatarioId;
  /** Usuário que dispara a operação, quando houver. */
  criadoPorUsuarioId?: UsuarioId | null;
  /** Formato de saída desejado. */
  formato: FormatoExportacao;
  /** Parâmetros opcionais da exportação. */
  parametros?: Record<string, unknown>;
}

/**
 * Saída da solicitação de exportação.
 */
export interface SolicitarExportacaoOutput {
  /** Exportação criada/registrada. */
  exportacao: Exportacao;
}

/**
 * Entrada para listar exportações de um locatário.
 */
export interface ListarExportacoesLocatarioInput {
  /** Locatário alvo da consulta. */
  locatarioId: LocatarioId;
}

/**
 * Saída da listagem de exportações do locatário.
 */
export interface ListarExportacoesLocatarioOutput {
  /** Locatário consultado. */
  locatarioId: LocatarioId;
  /** Exportações encontradas. */
  exportacoes: Exportacao[];
}

/**
 * Entrada para marcar uma exportação como em execução.
 */
export interface MarcarExportacaoEmExecucaoInput {
  /** Exportação a ser atualizada. */
  exportacaoId: ExportacaoId;
}

/**
 * Entrada para marcar uma exportação como concluída.
 */
export interface MarcarExportacaoConcluidaInput {
  /** Exportação concluída. */
  exportacaoId: ExportacaoId;
  /** Referência do artefato gerado. */
  referenciaResultado: string;
}

/**
 * Entrada para marcar uma exportação com falha.
 */
export interface MarcarExportacaoComFalhaInput {
  /** Exportação que falhou. */
  exportacaoId: ExportacaoId;
  /** Mensagem descritiva da falha. */
  mensagemErro: string;
}

/**
 * Parâmetros internos de criação/rehidratação de uma exportação.
 *
 * Útil para repositórios e adaptadores de persistência.
 */
export interface RegistrarExportacaoParams {
  /** Identificador opcional em cenários controlados de persistência. */
  exportacaoId?: ExportacaoId;
  /** Locatário proprietário da exportação. */
  locatarioId: LocatarioId;
  /** Usuário que originou a exportação, quando houver. */
  criadoPorUsuarioId?: UsuarioId | null;
  /** Formato da exportação. */
  formato: FormatoExportacao;
  /** Estado inicial ou atual do job. */
  status: StatusJob;
  /** Parâmetros da exportação. */
  parametros: Record<string, unknown>;
  /** Referência ao resultado, quando já existente. */
  referenciaResultado?: string | null;
  /** Mensagem de erro, quando já existente. */
  mensagemErro?: string | null;
  /** Data de criação do registro. */
  criadoEm: Date;
  /** Data de atualização do registro. */
  atualizadoEm: Date;
}

/**
 * Dependências necessárias para criação do serviço de exportações.
 *
 * Este serviço orquestra o ciclo de vida de exportações assíncronas,
 * incluindo criação, listagem e transições de status.
 *
 * Dependências:
 * - `exportacoesRepositorio`: persistência e consulta das exportações;
 * - `transacao`: execução opcional de operações compostas com atomicidade;
 * - `agora`: relógio opcional para timestamps;
 * - `gerarId`: gerador opcional de identificadores.
 */
// export interface CriarExportacoesServiceDeps {
//   exportacoesRepositorio: ExportacoesRepositorio;
//   transacao?: PortaTransacao;
//   agora?: RelogioPorta;
//   gerarId?: IdPorta;
// }