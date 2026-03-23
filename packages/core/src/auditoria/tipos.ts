// packages/core/src/auditoria/tipos.ts

import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

/**
 * Identificador lógico de um evento de auditoria persistido.
 */
export type AuditoriaId = string;

/**
 * Estrutura base compartilhada por comandos de auditoria.
 *
 * Contém os campos semânticos comuns a eventos de locatário e de plataforma.
 */
export interface EventoAuditoriaBase {
  /** Nome/código do evento auditado. */
  evento: string;
  /** Indica se a operação auditada foi bem-sucedida. */
  sucesso: boolean;
  /** Código de erro associado, quando houver falha. */
  erroCodigo?: string | null;
  /** Mensagem de erro associada, quando houver falha. */
  erroMensagem?: string | null;
  /** Nome amigável da entidade afetada, quando aplicável. */
  entidadeNome?: string | null;
  /** Tipo da entidade afetada, quando aplicável. */
  entidadeTipo?: string | null;
  /** Identificador da entidade afetada, quando aplicável. */
  entidadeId?: string | null;
  /** Origem lógica do evento, como API, job ou integração. */
  origem?: string | null;
  /** Identificador de correlação/requisição, quando disponível. */
  requisicaoId?: string | null;
  /** Endereço IP associado ao evento, quando disponível. */
  enderecoIp?: string | null;
  /** User-agent ou agente textual associado ao evento. */
  agenteUsuario?: string | null;
  /** Tipo do agente que originou a ação. */
  agenteTipo?: string | null;
  /** Metadados livres e serializáveis do evento. */
  metadados?: Record<string, unknown>;
}

/**
 * Evento de auditoria pertencente ao contexto de um locatário.
 */
export interface EventoAuditoriaLocatario {
  /** Identificador do evento persistido. */
  auditoriaId: AuditoriaId;
  /** Locatário no qual o evento ocorreu. */
  locatarioId: LocatarioId;
  /** Usuário responsável pela ação auditada. */
  usuarioId: UsuarioId;
  /** Nome/código do evento. */
  evento: string;
  /** Indica sucesso ou falha da operação. */
  sucesso: boolean;
  /** Código de erro registrado, quando houver. */
  erroCodigo: string | null;
  /** Mensagem de erro registrada, quando houver. */
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
  /** Tipo do agente que executou a ação. */
  agenteTipo: string | null;
  /** Metadados adicionais do evento. */
  metadados: Record<string, unknown>;
  /** Data/hora de criação do registro de auditoria. */
  criadoEm: Date;
}

/**
 * Evento de auditoria pertencente ao contexto de plataforma.
 */
export interface EventoAuditoriaPlataforma {
  /** Identificador do evento persistido. */
  auditoriaId: AuditoriaId;
  /** Usuário responsável pela ação auditada. */
  usuarioId: UsuarioId;
  /** Locatário alvo da ação, quando houver escopo de locatário. */
  locatarioAlvoId: LocatarioId | null;
  /** Nome/código do evento. */
  evento: string;
  /** Indica sucesso ou falha da operação. */
  sucesso: boolean;
  /** Código de erro registrado, quando houver. */
  erroCodigo: string | null;
  /** Mensagem de erro registrada, quando houver. */
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
  /** Tipo do agente que executou a ação. */
  agenteTipo: string | null;
  /** Metadados adicionais do evento. */
  metadados: Record<string, unknown>;
  /** Data/hora de criação do registro. */
  criadoEm: Date;
}

/**
 * Entrada para registrar evento de auditoria no escopo de locatário.
 */
export interface RegistrarEventoLocatarioInput extends EventoAuditoriaBase {
  /** Locatário ao qual o evento pertence. */
  locatarioId: LocatarioId;
  /** Usuário responsável pelo evento. */
  usuarioId: UsuarioId;
}

/**
 * Entrada para registrar evento de auditoria no escopo de plataforma.
 */
export interface RegistrarEventoPlataformaInput extends EventoAuditoriaBase {
  /** Usuário responsável pelo evento. */
  usuarioId: UsuarioId;
  /** Locatário alvo, quando a ação da plataforma afetar um locatário. */
  locatarioAlvoId?: LocatarioId | null;
}

/**
 * Filtros de consulta para auditoria de locatário.
 */
export interface ListarAuditoriaLocatarioInput {
  /** Locatário cuja trilha será consultada. */
  locatarioId: LocatarioId;
  /** Filtro opcional por tipo de entidade. */
  entidadeTipo?: string;
  /** Filtro opcional por identificador de entidade. */
  entidadeId?: string;
  /** Filtro opcional por nome/código do evento. */
  evento?: string;
  /** Limite máximo de itens retornados. */
  limite?: number;
}

/**
 * Filtros de consulta para auditoria de plataforma.
 */
export interface ListarAuditoriaPlataformaInput {
  /** Locatário alvo, quando a pesquisa for restringida a um locatário. */
  locatarioAlvoId?: LocatarioId | null;
  /** Filtro opcional por tipo de entidade. */
  entidadeTipo?: string;
  /** Filtro opcional por identificador de entidade. */
  entidadeId?: string;
  /** Filtro opcional por nome/código do evento. */
  evento?: string;
  /** Limite máximo de itens retornados. */
  limite?: number;
}
