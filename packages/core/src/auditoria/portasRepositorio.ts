// packages/core/src/auditoria/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel";
import type { EventoAuditoriaAtivaLocatario, EventoAuditoriaInterna, ListarAuditoriaAtivaLocatarioInput, ListarAuditoriaInternaInput,
   RegistrarEventoAuditoriaInternaInput } from "./tipos";

/**
 * Porta de persistência da auditoria interna da plataforma.
 *
 * Esta é a trilha canônica do sistema.
 */
export interface AuditoriaInternaRepositorio {
  /**
   * Registra um evento na trilha interna.
   *
   * @param input Dados do evento a persistir.
   * @returns `Ok(eventoPersistido)` ou `Err(ErroApp)`.
   */
  registrarEvento(input: RegistrarEventoAuditoriaInternaInput): Promise<Result<EventoAuditoriaInterna, ErroApp>>;

  /**
   * Lista eventos da auditoria interna com filtros avançados.
   *
   * @param input Filtros de consulta.
   * @returns `Ok(eventos)` ou `Err(ErroApp)`.
   */
  listarEventos(input: ListarAuditoriaInternaInput): Promise<Result<EventoAuditoriaInterna[], ErroApp>>;
}

/**
 * Porta de leitura da auditoria ativa do locatário.
 *
 * Esta porta representa o produto visível ao cliente.
 */
export interface AuditoriaAtivaLocatarioRepositorio {
  /**
   * Lista eventos visíveis ao locatário.
   *
   * @param input Filtros de consulta.
   * @returns `Ok(eventos)` ou `Err(ErroApp)`.
   */
  listarEventos(input: ListarAuditoriaAtivaLocatarioInput): Promise<Result<EventoAuditoriaAtivaLocatario[], ErroApp>>;
}
