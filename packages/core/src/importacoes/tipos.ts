// packages/core/src/importacoes/tipos.ts

import { StatusJob } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import { UsuarioId } from "../usuarios/index.js";

/**
 * Identificador lógico de uma importação.
 */
export type ImportacaoId = string;

/**
 * Identificador lógico de um item processado dentro de uma importação.
 */
export type ItemImportacaoId = string;

/**
 * Tipos de origem aceitos para uma importação.
 */
export type TipoOrigemImportacao =
  | "ARQUIVO"
  | "PLANILHA"
  | "URL"
  | "SISTEMA_EXTERNO";

/**
 * Entidade de domínio que representa uma importação solicitada.
 *
 * No esquema v16, importações também servem como base para restauração lógica
 * de locatário em operações especializadas.
 */
export interface Importacao {
  /** Identificador da importação. */
  importacaoId: ImportacaoId;
  /** Locatário ao qual a importação pertence. */
  locatarioId: LocatarioId;
  /** Usuário que criou a importação, quando identificado. */
  criadoPorUsuarioId: UsuarioId | null;
  /** Tipo/origem da importação. */
  tipoOrigem: TipoOrigemImportacao;
  /** Referência externa da origem, quando houver. */
  referenciaOrigem: string | null;
  /** Estado atual do job. */
  status: StatusJob;
  /** Mapeamento de colunas/campos utilizado na importação. */
  mapeamentoColunas: Record<string, unknown>;
  /** Estatísticas agregadas de processamento. */
  estatisticas: Record<string, unknown>;
  /** Mensagem de erro, quando houver falha. */
  mensagemErro: string | null;
  /** Data/hora de início do processamento. */
  iniciadoEm: Date | null;
  /** Data/hora de término do processamento. */
  finalizadoEm: Date | null;
  /** Data/hora de criação do registro. */
  criadoEm: Date;
  /** Data/hora da última atualização do registro. */
  atualizadoEm: Date;
}

/**
 * Entidade que representa um item individual processado dentro de uma importação.
 */
export interface ItemImportacao {
  /** Identificador do item. */
  itemImportacaoId: ItemImportacaoId;
  /** Importação à qual o item pertence. */
  importacaoId: ImportacaoId;
  /** Locatário ao qual o item pertence. */
  locatarioId: LocatarioId;
  /** Número da linha ou posição lógica do item. */
  numeroLinha: number;
  /** Dados brutos associados ao item. */
  dadosBrutos: Record<string, unknown>;
  /** Estado do item durante o processamento. */
  status: StatusJob;
  /** Detalhe textual de erro, quando houver. */
  detalheErro: string | null;
  /** Data/hora de criação do item. */
  criadoEm: Date;
}

/**
 * Entrada para solicitar uma nova importação.
 */
export interface SolicitarImportacaoInput {
  /** Locatário dono da importação. */
  locatarioId: LocatarioId;
  /** Usuário que dispara a operação, quando houver. */
  criadoPorUsuarioId?: UsuarioId | null;
  /** Tipo de origem da importação. */
  tipoOrigem: TipoOrigemImportacao;
  /** Referência externa da origem, quando houver. */
  referenciaOrigem?: string | null;
  /** Mapeamento inicial de colunas/campos. */
  mapeamentoColunas?: Record<string, unknown>;
}

/**
 * Saída da solicitação de importação.
 */
export interface SolicitarImportacaoOutput {
  /** Importação criada/registrada. */
  importacao: Importacao;
}

/**
 * Entrada para registrar um item de importação.
 */
export interface RegistrarItemImportacaoInput {
  /** Importação à qual o item será associado. */
  importacaoId: ImportacaoId;
  /** Locatário do item. */
  locatarioId: LocatarioId;
  /** Número lógico da linha/item. */
  numeroLinha: number;
  /** Dados brutos do item. */
  dadosBrutos: Record<string, unknown>;
}

/**
 * Entrada para listar importações de um locatário.
 */
export interface ListarImportacoesLocatarioInput {
  /** Locatário alvo da consulta. */
  locatarioId: LocatarioId;
}

/**
 * Entrada para listar itens de uma importação.
 */
export interface ListarItensImportacaoInput {
  /** Importação alvo da consulta. */
  importacaoId: ImportacaoId;
  /** Locatário dono da importação. */
  locatarioId: LocatarioId;
}

/**
 * Entrada para marcar importação como em execução.
 */
export interface MarcarImportacaoEmExecucaoInput {
  /** Importação a ser atualizada. */
  importacaoId: ImportacaoId;
}

/**
 * Entrada para marcar importação como concluída.
 */
export interface MarcarImportacaoConcluidaInput {
  /** Importação concluída. */
  importacaoId: ImportacaoId;
  /** Estatísticas finais da execução, quando houver. */
  estatisticas?: Record<string, unknown>;
}

/**
 * Entrada para marcar importação com falha.
 */
export interface MarcarImportacaoComFalhaInput {
  /** Importação que falhou. */
  importacaoId: ImportacaoId;
  /** Mensagem descritiva da falha. */
  mensagemErro: string;
}

/**
 * Entrada para marcar item de importação como processado com sucesso.
 */
export interface MarcarItemImportacaoProcessadoInput {
  /** Item que será marcado como processado. */
  itemImportacaoId: ItemImportacaoId;
}

/**
 * Entrada para marcar item de importação com falha.
 */
export interface MarcarItemImportacaoComFalhaInput {
  /** Item que falhou no processamento. */
  itemImportacaoId: ItemImportacaoId;
  /** Descrição do erro associado ao item. */
  detalheErro: string;
}

/**
 * Parâmetros internos de criação/rehidratação de uma importação.
 */
export interface RegistrarImportacaoParams {
  /** Identificador opcional em cenários controlados de persistência. */
  importacaoId?: ImportacaoId;
  /** Locatário proprietário da importação. */
  locatarioId: LocatarioId;
  /** Usuário que originou a importação, quando houver. */
  criadoPorUsuarioId?: UsuarioId | null;
  /** Tipo de origem da importação. */
  tipoOrigem: TipoOrigemImportacao;
  /** Referência externa da origem, quando houver. */
  referenciaOrigem?: string | null;
  /** Estado inicial ou atual do job. */
  status: StatusJob;
  /** Mapeamento de colunas/campos. */
  mapeamentoColunas: Record<string, unknown>;
  /** Estatísticas acumuladas ou finais. */
  estatisticas: Record<string, unknown>;
  /** Mensagem de erro, quando houver. */
  mensagemErro?: string | null;
  /** Data/hora de início, quando houver. */
  iniciadoEm?: Date | null;
  /** Data/hora de término, quando houver. */
  finalizadoEm?: Date | null;
  /** Data de criação do registro. */
  criadoEm: Date;
  /** Data de atualização do registro. */
  atualizadoEm: Date;
}

/**
 * Parâmetros internos de criação/rehidratação de item de importação.
 */
export interface RegistrarItemImportacaoParams {
  /** Identificador opcional do item. */
  itemImportacaoId?: ItemImportacaoId;
  /** Importação à qual o item pertence. */
  importacaoId: ImportacaoId;
  /** Locatário proprietário do item. */
  locatarioId: LocatarioId;
  /** Número lógico da linha/item. */
  numeroLinha: number;
  /** Dados brutos recebidos para processamento. */
  dadosBrutos: Record<string, unknown>;
  /** Estado atual do item. */
  status: StatusJob;
  /** Detalhe de erro, quando houver. */
  detalheErro?: string | null;
  /** Data de criação do item. */
  criadoEm: Date;
}


/**
 * Dependências necessárias para criação do serviço de importações.
 *
 * Este serviço orquestra:
 * - o agregado principal de importações;
 * - os itens pertencentes à importação;
 * - transições de estado do job e dos itens;
 * - transações opcionais;
 * - materialização de tempo e geração de IDs.
 */
// export interface CriarImportacoesServiceDeps {
//   importacoesRepositorio: ImportacoesRepositorio;
//   itensImportacaoRepositorio: ItensImportacaoRepositorio;
//   transacao?: PortaTransacao;
//   agora?: RelogioPorta;
//   gerarId?: IdPorta;
// }