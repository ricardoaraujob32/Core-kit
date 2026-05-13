// packages/core/src/auditoria/tipos.ts

import { ErroApp, Result } from "../kernel";
import type { LocatarioId } from "../locatarios";
import type { UsuarioId } from "../usuarios";

export type AuditoriaId = string;

export type CategoriaAuditoria =
  | "OPERACAO"
  | "SEGURANCA"
  | "ERRO"
  | "COMPLIANCE";

export interface EventoAuditoriaBase {
  auditoriaId: AuditoriaId;
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

export interface EventoAuditoriaLocatario extends EventoAuditoriaBase {
  locatarioId: LocatarioId;
}

export interface EventoAuditoriaPlataforma extends EventoAuditoriaBase {
  superadminUsuarioId: UsuarioId | null;
  locatarioAlvoId: LocatarioId | null;
}

export interface RegistrarEventoAuditoriaLocatarioInput {
  locatarioId: LocatarioId;
  usuarioId?: UsuarioId | null;
  evento: string;
  categoria?: CategoriaAuditoria;
  sucesso: boolean;
  erroCodigo?: string | null;
  erroMensagem?: string | null;
  entidadeNome?: string | null;
  entidadeTipo?: string | null;
  entidadeId?: string | null;
  origem?: string | null;
  requisicaoId?: string | null;
  enderecoIp?: string | null;
  agenteUsuario?: string | null;
  agenteTipo?: string | null;
  metadados?: Record<string, unknown>;
}

export interface RegistrarEventoAuditoriaPlataformaInput {
  superadminUsuarioId?: UsuarioId | null;
  locatarioAlvoId?: LocatarioId | null;
  evento: string;
  categoria?: CategoriaAuditoria;
  sucesso: boolean;
  erroCodigo?: string | null;
  erroMensagem?: string | null;
  entidadeNome?: string | null;
  entidadeTipo?: string | null;
  entidadeId?: string | null;
  origem?: string | null;
  requisicaoId?: string | null;
  enderecoIp?: string | null;
  agenteUsuario?: string | null;
  agenteTipo?: string | null;
  metadados?: Record<string, unknown>;
}

export interface RegistrarEventoAuditoriaLocatarioOutput {
  evento: EventoAuditoriaLocatario;
}

export interface RegistrarEventoAuditoriaPlataformaOutput {
  evento: EventoAuditoriaPlataforma;
}

export type RegistrarEventoAuditoriaLocatarioResult =
  Promise<Result<RegistrarEventoAuditoriaLocatarioOutput, ErroApp>>;

export type RegistrarEventoAuditoriaPlataformaResult =
  Promise<Result<RegistrarEventoAuditoriaPlataformaOutput, ErroApp>>;

export interface FiltrosAuditoriaBase {
  evento?: string;
  eventoPrefixo?: string;
  categoria?: CategoriaAuditoria;
  sucesso?: boolean;
  erroCodigo?: string;
  entidadeNome?: string;
  entidadeTipo?: string;
  entidadeId?: string;
  usuarioId?: UsuarioId;
  origem?: string;
  requisicaoId?: string;
  agenteTipo?: string;
  criadoDe?: Date;
  criadoAte?: Date;
  textoLivre?: string;
  cursor?: string;
  limite?: number;
}

export interface ListarAuditoriaLocatarioInput extends FiltrosAuditoriaBase {
  locatarioId: LocatarioId;
}

export interface ListarAuditoriaPlataformaInput extends FiltrosAuditoriaBase {
  superadminUsuarioId?: UsuarioId;
  locatarioAlvoId?: LocatarioId;
}

export interface ListarAuditoriaLocatarioOutput {
  itens: EventoAuditoriaLocatario[];
}

export interface ListarAuditoriaPlataformaOutput {
  itens: EventoAuditoriaPlataforma[];
}

export type ListarAuditoriaLocatarioResult =
  Promise<Result<ListarAuditoriaLocatarioOutput, ErroApp>>;

export type ListarAuditoriaPlataformaResult =
  Promise<Result<ListarAuditoriaPlataformaOutput, ErroApp>>;