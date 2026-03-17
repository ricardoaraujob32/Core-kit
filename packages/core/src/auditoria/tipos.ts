import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

export type AuditoriaId = string;

export interface EventoAuditoriaBase {
  evento: string;
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

export interface EventoAuditoriaLocatario {
  auditoriaId: AuditoriaId;
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  evento: string;
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

export interface EventoAuditoriaPlataforma {
  auditoriaId: AuditoriaId;
  usuarioId: UsuarioId;
  locatarioAlvoId: LocatarioId | null;
  evento: string;
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

export interface RegistrarEventoLocatarioInput extends EventoAuditoriaBase {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
}

export interface RegistrarEventoPlataformaInput extends EventoAuditoriaBase {
  usuarioId: UsuarioId;
  locatarioAlvoId?: LocatarioId | null;
}

export interface ListarAuditoriaLocatarioInput {
  locatarioId: LocatarioId;
  entidadeTipo?: string;
  entidadeId?: string;
  evento?: string;
  limite?: number;
}

export interface ListarAuditoriaPlataformaInput {
  locatarioAlvoId?: LocatarioId | null;
  entidadeTipo?: string;
  entidadeId?: string;
  evento?: string;
  limite?: number;
}