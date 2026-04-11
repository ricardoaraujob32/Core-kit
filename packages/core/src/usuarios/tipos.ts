// packages/core/src/usuarios/tipos.ts

import type { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";

/**
 * Identificador lógico de um usuário.
 *
 * Deve ser usado como identidade canônica do usuário em autenticação,
 * autorização, auditoria e operações administrativas.
 */
export type UsuarioId = string;

/**
 * Estados possíveis do ciclo de vida de um usuário.
 *
 * - `ATIVO`: usuário apto a autenticar e operar.
 * - `INATIVO`: usuário desabilitado sem caráter punitivo.
 * - `SUSPENSO`: usuário bloqueado temporariamente.
 * - `ENCERRADO`: usuário encerrado de forma definitiva do ponto de vista do domínio.
 */
export type StatusUsuario =
  | "ATIVO"
  | "INATIVO"
  | "SUSPENSO"
  | "ENCERRADO";

/**
 * Eventos formais da máquina de estados de usuários.
 */
export type EventoUsuario =
  | "OPERAR"
  | "INATIVAR"
  | "REATIVAR"
  | "SUSPENDER"
  | "ENCERRAR";

/**
 * Entidade de domínio que representa um usuário.
 *
 * O campo `locatarioId` pode ser nulo para acomodar cenários de identidade
 * de plataforma, como superadmin, quando a modelagem assim exigir.
 */
export interface Usuario {
  /** Identificador único do usuário. */
  usuarioId: UsuarioId;
  /** Locatário ao qual o usuário pertence, quando aplicável. */
  locatarioId: LocatarioId | null;
  /** E-mail principal do usuário. */
  email: string;
  /** Nome exibível do usuário. */
  nome: string;
  /** Hash da senha persistida. Nunca deve conter senha em texto puro. */
  senhaHash: string;
  /** Estado atual do usuário no domínio. */
  status: StatusUsuario;
  /** Data/hora do último login bem-sucedido. */
  ultimoLoginEm: Date | null;
  /** Data/hora de criação do usuário. */
  criadoEm: Date;
  /** Data/hora da última atualização do usuário. */
  atualizadoEm: Date;
  /** Marca de exclusão lógica, quando houver. */
  excluidoEm: Date | null;
}

/**
 * Dados necessários para criar um usuário.
 */
export interface CriarUsuarioInput {
  /** Locatário ao qual o usuário será vinculado. */
  locatarioId: LocatarioId;
  /** E-mail do novo usuário. */
  email: string;
  /** Nome do novo usuário. */
  nome: string;
  /** Hash da senha inicial. */
  senhaHash: string;
}

/**
 * Retorno mínimo da operação de criação de usuário.
 */
export interface CriarUsuarioOutput {
  /** Identificador atribuído ao usuário recém-criado. */
  usuarioId: UsuarioId;
}

/**
 * Resultado assíncrono da criação de usuário.
 */
export type CriarUsuarioResult = Promise<Result<CriarUsuarioOutput, ErroApp>>;

/**
 * Entrada para obter um usuário específico.
 */
export interface ObterUsuarioInput {
  locatarioId: LocatarioId;
  /** Identificador do usuário desejado. */
  usuarioId: UsuarioId;
}

/**
 * Saída para obter um usuário específico.
 */
export interface ObterUsuarioOutput {
  usuario: Usuario;
}

/**
 * Resultado assíncrono da obtenção de usuário.
 */
export type ObterUsuarioResult = Promise<Result<ObterUsuarioOutput, ErroApp>>;

/**
 * Entrada para atualização parcial de dados cadastrais do usuário.
 */
export interface AtualizarUsuarioInput {
  locatarioId: LocatarioId;
  /** Usuário a ser atualizado. */
  usuarioId: UsuarioId;
  /** Novo nome, quando houver alteração. */
  nome?: string;
  /** Novo e-mail, quando houver alteração. */
  email?: string;
}

/**
 * Saída para atualização parcial de dados cadastrais do usuário.
 */
export interface AtualizarUsuarioOutput {
  usuario: Usuario;
}

/**
 * Resultado assíncrono da atualização de usuário.
 */
export type AtualizarUsuarioResult = Promise<Result<AtualizarUsuarioOutput, ErroApp>>;

/**
 * Entrada para inativação de usuário.
 */
export interface DesativarUsuarioInput {
  locatarioId: LocatarioId;
  /** Usuário que será inativado. */
  usuarioId: UsuarioId;
}

/**
 * Saída para inativação de usuário.
 */
export interface DesativarUsuarioOutput {
  usuario: Usuario;
}

/**
 * Resultado assíncrono da inativação de usuário.
 */
export type DesativarUsuarioResult = Promise<Result<DesativarUsuarioOutput, ErroApp>>;

/**
 * Entrada para reativação de usuário.
 */
export interface ReativarUsuarioInput {
  locatarioId: LocatarioId;
  /** Usuário que será reativado. */
  usuarioId: UsuarioId;
}

/**
 * Saída para reativação de usuário.
 */
export interface ReativarUsuarioOutput {
  usuario: Usuario;
}

/**
 * Resultado assíncrono da reativação de usuário.
 */
export type ReativarUsuarioResult = Promise<Result<ReativarUsuarioOutput, ErroApp>>;

/**
 * Entrada para listar usuários de um locatário.
 */
export interface ListarUsuariosPorLocatarioInput {
  /** Locatário alvo da listagem. */
  locatarioId: LocatarioId;
}

/**
 * Saída padronizada da listagem de usuários por locatário.
 */
export interface ListarUsuariosPorLocatarioOutput {
  /** Usuários retornados pela consulta. */
  itens: Usuario[];
}

/**
 * Resultado assíncrono da listagem de usuários por locatário.
 */
export type ListarUsuariosPorLocatarioResult = Promise<Result<ListarUsuariosPorLocatarioOutput, ErroApp>>;
