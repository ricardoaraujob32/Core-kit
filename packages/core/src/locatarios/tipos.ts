// packages/core/src/locatarios/tipos.ts

import type { ErroApp, Result, wrapOk } from "../kernel";
import { locatarioInvalido } from "./erros";

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
 * - `ENCERRADO`: locatário em processo de encerramento.
 * - `EXCLUIDO`: locatário excluído do ponto de vista de negócio.
 */
export type LocatarioStatus =
  | "ATIVO"
  | "SUSPENSO"
  | "ENCERRADO"
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
 * Modo de tema da configuração visual do locatário.
 */
export type ModoTemaLocatario =
  | "SISTEMA"
  | "CLARO"
  | "ESCURO";

/**
 * Identificador lógico de configuração do locatário.
 */
export type ConfiguracaoLocatarioId = string;

/**
 * Configuração visual/operacional associada ao locatário.
 */
export interface ConfiguracaoLocatario {
  locatarioId: LocatarioId;
  configuracaoId: ConfiguracaoLocatarioId;
  modoTema: ModoTemaLocatario;
  identidadeVisual: string;
  corPrimaria: string | null;
  corSecundaria: string | null;
  corTerciaria: string | null;
  urlLogo: string | null;
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Entidade de domínio do locatário.
 */
export interface Locatario {
  locatarioId: LocatarioId;
  nome: string;
  slug: LocatarioSlug;
  documento: string | null;
  email: string;
  fusoHorario: string;
  status: LocatarioStatus;
  criadoEm: Date;
  atualizadoEm: Date;
  excluidoEm: Date | null;
  motivoExclusao: string | null;
  suspensoEm: Date | null;
  motivoSuspensao: string | null;
  reativadoEm: Date | null;
  motivoReativacao: string | null;
  configuracoes: ConfiguracaoLocatario[];
}


/**
 * Entrada de criação de locatário.
 */
export interface CriarLocatarioInput {
  nome: string;
  slug: LocatarioSlug;
  email: string;
  documento?: string | null;
  fusoHorario?: string;
  configuracaoInicial?: {
    modoTema?: ModoTemaLocatario;
    identidadeVisual?: string;
    corPrimaria?: string | null;
    corSecundaria?: string | null;
    corTerciaria?: string | null;
    urlLogo?: string | null;
    ativa?: boolean;
  };
}

/**
 * Saída de criação de locatário.
 */
export interface CriarLocatarioOutput {
  locatarioId: LocatarioId;
}

/**
 * Resultado assíncrono da criação.
 */
export type CriarLocatarioResult = Promise<Result<CriarLocatarioOutput, ErroApp>>;

/**
 * Entrada de listagem.
 */
export interface ListarLocatariosInput {}

/**
 * Saída de listagem.
 */
export interface ListarLocatariosOutput {
  itens: Locatario[];
}

/**
 * Resultado assíncrono da listagem.
 */
export type ListarLocatariosResult = Promise<Result<ListarLocatariosOutput, ErroApp>>;

/**
 * Entrada de obtenção por id.
 */
export interface ObterLocatarioInput {
  locatarioId: LocatarioId;
}

/**
 * Saída de obtenção.
 */
export interface ObterLocatarioOutput {
  locatario: Locatario;
}

/**
 * Resultado assíncrono da obtenção.
 */
export type ObterLocatarioResult = Promise<Result<ObterLocatarioOutput, ErroApp>>;

/**
 * Entrada de atualização cadastral.
 */
export interface AtualizarLocatarioInput {
  locatarioId: LocatarioId;
  nome?: string;
  email?: string;
  documento?: string | null;
  fusoHorario?: string;
}

/**
 * Saída de atualização cadastral.
 */
export interface AtualizarLocatarioOutput {
  locatario: Locatario;
}

/**
 * Resultado assíncrono da atualização.
 */
export type AtualizarLocatarioResult = Promise<Result<AtualizarLocatarioOutput, ErroApp>>;

/**
 * 
 */
export interface SuspenderLocatarioInput {
  locatarioId: LocatarioId;
  motivoSuspensao?: string | null;
}

/**
 * 
 */
export type SuspenderLocatarioResult = Promise<
  ReturnType<typeof wrapOk<AtualizarLocatarioOutput>> | ReturnType<typeof locatarioInvalido>
>;

/**
 * 
 */
export interface ReativarLocatarioInput {
  locatarioId: LocatarioId;
  motivoReativacao?: string | null;
}

export interface ReativarLocatarioOutput {
  locatario: Locatario;
}

export type ReativarLocatarioResult = Promise<Result<ReativarLocatarioOutput, ErroApp>>;

/**
 * 
 */
export interface EncerrarLocatarioInput {
  locatarioId: LocatarioId;
  motivoExclusao?: string | null;
}

/**
 * 
 */
export interface CriarConfiguracaoLocatarioInput {
  locatarioId: LocatarioId;
  modoTema?: string;
  identidadeVisual: string;
  corPrimaria?: string | null;
  corSecundaria?: string | null;
  corTerciaria?: string | null;
  urlLogo?: string | null;
  ativa?: boolean;
}

export interface CriarConfiguracaoLocatarioOutput {
  configuracaoId: ConfiguracaoLocatarioId;
}

export type CriarConfiguracaoLocatarioResult = Promise<Result<CriarConfiguracaoLocatarioOutput, ErroApp>>;

/**
 * 
 */
export interface AtualizarConfiguracaoLocatarioInput {
  locatarioId: LocatarioId;
  configuracaoId: string;
  modoTema?: string;
  identidadeVisual?: string;
  corPrimaria?: string | null;
  corSecundaria?: string | null;
  corTerciaria?: string | null;
  urlLogo?: string | null;
}

export interface AtualizarConfiguracaoLocatarioOutput {
  configuracao: ConfiguracaoLocatario;
}

export type AtualizarConfiguracaoLocatarioResult = Promise<Result<AtualizarConfiguracaoLocatarioOutput, ErroApp>>;

/**
 * 
 */
export interface AtivarConfiguracaoLocatarioInput {
  locatarioId: LocatarioId;
  configuracaoId: string;
}

export interface AtivarConfiguracaoLocatarioOutput {
  configuracao: ConfiguracaoLocatario;
}

export type AtivarConfiguracaoLocatarioResult = Promise<Result<AtivarConfiguracaoLocatarioOutput, ErroApp>>;
