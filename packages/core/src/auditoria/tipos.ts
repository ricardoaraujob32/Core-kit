// packages/core/src/auditoria/tipos.ts

import { ErroApp, Result } from "../kernel";
import type { LocatarioId } from "../locatarios";
import type { UsuarioId } from "../usuarios";

/**
 * Identificador lógico de um registro de auditoria.
 */
export type AuditoriaId = string;

/**
 * Tipo de escopo real do evento auditado.
 *
 * Observação:
 * - o escopo descreve onde o fato aconteceu;
 * - ele não define sozinho quem pode consultar o evento.
 */
export type EscopoAuditoria = "PLATAFORMA" | "LOCATARIO";

/**
 * Política de visibilidade do evento.
 *
 * Regras:
 * - `INTERNA`: somente a plataforma pode consultar;
 * - `CLIENTE`: somente o locatário pode consultar;
 * - `AMBOS`: visível internamente e também na auditoria ativa do cliente.
 */
export type VisibilidadeAuditoria = "INTERNA" | "CLIENTE" | "AMBOS";

/**
 * Categoria semântica do evento auditado.
 *
 * Ajuda a separar:
 * - operação de negócio;
 * - segurança;
 * - falha técnica;
 * - compliance.
 */
export type CategoriaAuditoria =
  | "OPERACAO"
  | "SEGURANCA"
  | "ERRO"
  | "COMPLIANCE";

/**
 * Estrutura base comum a todos os eventos de auditoria.
 */
export interface EventoAuditoriaBase {
  /** Nome/código estável do evento. Ex.: `usuario.criado`. */
  evento: string;

  /** Categoria semântica do evento. */
  categoria: CategoriaAuditoria;

  /** Indica se a operação principal foi bem-sucedida. */
  sucesso: boolean;

  /** Código de erro associado, quando houver falha. */
  erroCodigo?: string | null;

  /** Mensagem de erro associada, quando houver falha. */
  erroMensagem?: string | null;

  /** Nome amigável da entidade afetada. */
  entidadeNome?: string | null;

  /** Tipo da entidade afetada. Ex.: `usuario`, `locatario`, `token`. */
  entidadeTipo?: string | null;

  /** Identificador da entidade afetada. */
  entidadeId?: string | null;

  /** Origem lógica do evento. Ex.: `API`, `JOB`, `INTEGRACAO`. */
  origem?: string | null;

  /** Identificador de correlação/requisição. */
  requisicaoId?: string | null;

  /** Endereço IP associado ao evento. */
  enderecoIp?: string | null;

  /** User-agent ou identificador textual do agente. */
  agenteUsuario?: string | null;

  /** Tipo do agente executor. Ex.: `USUARIO_AUTENTICADO`, `SUPERADMIN`, `JOB`. */
  agenteTipo?: string | null;

  /** Metadados livres, serializáveis e seguros. */
  metadados?: Record<string, unknown>;
}

/**
 * Registro interno de auditoria da plataforma.
 *
 * Este é o modelo canônico do domínio de auditoria.
 * Toda trilha nasce aqui, independentemente de depois ser exposta ao cliente ou não.
 */
export interface EventoAuditoriaInterna {
  /** Identificador persistido do evento. */
  auditoriaId: AuditoriaId;

  /** Escopo onde o fato ocorreu. */
  escopo: EscopoAuditoria;

  /** Locatário do evento, quando o escopo for `LOCATARIO`. */
  locatarioId: LocatarioId | null;

  /** Usuário executor da ação, quando identificado. */
  usuarioId: UsuarioId | null;

  /** Nome/código do evento. */
  evento: string;

  /** Categoria semântica do evento. */
  categoria: CategoriaAuditoria;

  /** Resultado da operação. */
  sucesso: boolean;

  /** Política de visibilidade do registro. */
  visibilidade: VisibilidadeAuditoria;

  /** Código de erro registrado. */
  erroCodigo: string | null;

  /** Mensagem de erro registrada. */
  erroMensagem: string | null;

  /** Nome amigável da entidade afetada. */
  entidadeNome: string | null;

  /** Tipo da entidade afetada. */
  entidadeTipo: string | null;

  /** Identificador da entidade afetada. */
  entidadeId: string | null;

  /** Origem lógica do evento. */
  origem: string | null;

  /** Identificador de correlação/requisição. */
  requisicaoId: string | null;

  /** Endereço IP associado. */
  enderecoIp: string | null;

  /** User-agent ou identificador do agente. */
  agenteUsuario: string | null;

  /** Tipo do agente executor. */
  agenteTipo: string | null;

  /** Metadados adicionais do evento. */
  metadados: Record<string, unknown>;

  /** Timestamp de criação do registro. */
  criadoEm: Date;
}

/**
 * Visão de auditoria ativa do locatário.
 *
 * É uma projeção consultável pelo cliente, sempre derivada da auditoria interna
 * e restrita ao que for marcado como `CLIENTE` ou `AMBOS`.
 */
export interface EventoAuditoriaAtivaLocatario {
  auditoriaId: AuditoriaId;
  locatarioId: LocatarioId;
  usuarioId: UsuarioId | null;
  evento: string;
  categoria: CategoriaAuditoria;
  sucesso: boolean;
  erroCodigo: string | null;
  erroMensagem: string | null;
  entidadeNome: string | null;
  entidadeTipo: string | null;
  entidadeId: string | null;
  origem: string | null;
  requisicaoId: string | null;
  enderecoIp: string | null;
  agenteUsuario: string | null;
  agenteTipo: string | null;
  metadados: Record<string, unknown>;
  criadoEm: Date;
}

/**
 * Entrada para registrar um evento na auditoria interna.
 *
 * Observação:
 * - esta é a única operação de escrita do domínio;
 * - a auditoria ativa do cliente não registra eventos por conta própria.
 */
export interface RegistrarEventoAuditoriaInternaInput extends EventoAuditoriaBase {
  /** Escopo real do evento. */
  escopo: EscopoAuditoria;

  /** Locatário do evento, obrigatório quando `escopo === "LOCATARIO"`. */
  locatarioId?: LocatarioId | null;

  /** Usuário executor da ação, quando identificado. */
  usuarioId?: UsuarioId | null;

  /** Política de visibilidade do registro. */
  visibilidade?: VisibilidadeAuditoria;
}

/**
 * Saída do caso de uso registrarEventoAuditoriaInterna
 */
export interface RegistrarEventoAuditoriaInternaOutput {
  evento: EventoAuditoriaInterna;
}

/**
 * 
 */
export type RegistrarEventoAuditoriaInternaResult = Promise<Result<RegistrarEventoAuditoriaInternaOutput, ErroApp>>;

/**
 * Filtros compartilhados para consultas de auditoria.
 */
export interface FiltrosAuditoriaBase {
  /** Filtro exato por nome/código do evento. */
  evento?: string;

  /** Prefixo do evento. Ex.: `usuario.` */
  eventoPrefixo?: string;

  /** Filtro por categoria. */
  categoria?: CategoriaAuditoria;

  /** Filtro por sucesso/falha. */
  sucesso?: boolean;

  /** Filtro por código de erro. */
  erroCodigo?: string;

  /** Filtro por nome da entidade afetada. */
  entidadeNome?: string;

  /** Filtro por tipo da entidade afetada. */
  entidadeTipo?: string;

  /** Filtro por identificador da entidade. */
  entidadeId?: string;

  /** Filtro por usuário executor. */
  usuarioId?: UsuarioId;

  /** Filtro por origem lógica. */
  origem?: string;

  /** Filtro por identificador de requisição. */
  requisicaoId?: string;

  /** Filtro por tipo do agente executor. */
  agenteTipo?: string;

  /** Filtro por data/hora inicial. */
  criadoDe?: Date;

  /** Filtro por data/hora final. */
  criadoAte?: Date;

  /** Busca textual simples em campos indexáveis/projetáveis. */
  textoLivre?: string;

  /** Cursor para paginação. */
  cursor?: string;

  /** Limite máximo de resultados. */
  limite?: number;
}

/**
 * Filtros para consulta da auditoria interna.
 *
 * A plataforma pode consultar qualquer escopo, inclusive filtrar por visibilidade.
 */
export interface ListarAuditoriaInternaInput extends FiltrosAuditoriaBase {
  escopo?: EscopoAuditoria;
  locatarioId?: LocatarioId;
  visibilidade?: VisibilidadeAuditoria;
}

/**
 * Saída do caso de uso listarAuditoriInterna
 */
export interface ListarAuditoriaInternaOutput {
  itens: EventoAuditoriaInterna[];
}

/**
 * 
 */
export type ListarAuditoriaInternaResult = Promise<Result<ListarAuditoriaInternaOutput, ErroApp>>;

/**
 * Filtros para consulta da auditoria ativa do locatário.
 *
 * Regras:
 * - `locatarioId` é obrigatório;
 * - o repositório só deve expor eventos visíveis ao cliente.
 */
export interface ListarAuditoriaAtivaLocatarioInput extends FiltrosAuditoriaBase {
  locatarioId: LocatarioId;
}

/**
 * Saída do caso de uso listarAuditoriaAtivaLocatario
 */
export interface ListarAuditoriaAtivaLocatarioOutput {
  itens: EventoAuditoriaAtivaLocatario[];
}

/**
 * 
 */
export type ListarAuditoriaAtivaLocatarioResult = Promise<Result<ListarAuditoriaAtivaLocatarioOutput, ErroApp>>;
