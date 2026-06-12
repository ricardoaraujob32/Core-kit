// packages/core/src/auditoria/portasRepositorio.ts

import type { ErroApp, Result } from "../kernel/index.js";
import type { EventoAuditoriaLocatario, EventoAuditoriaPlataforma, ListarAuditoriaLocatarioInput, ListarAuditoriaPlataformaInput, RegistrarEventoAuditoriaLocatarioInput,
  RegistrarEventoAuditoriaPlataformaInput } from "./tipos.js";

export interface AuditoriaLocatarioRepositorio {
  registrarEvento(
    input: RegistrarEventoAuditoriaLocatarioInput,
  ): Promise<Result<EventoAuditoriaLocatario, ErroApp>>;

  listarEventos(
    input: ListarAuditoriaLocatarioInput,
  ): Promise<Result<EventoAuditoriaLocatario[], ErroApp>>;
}

export interface AuditoriaPlataformaRepositorio {
  registrarEvento(
    input: RegistrarEventoAuditoriaPlataformaInput,
  ): Promise<Result<EventoAuditoriaPlataforma, ErroApp>>;

  listarEventos(
    input: ListarAuditoriaPlataformaInput,
  ): Promise<Result<EventoAuditoriaPlataforma[], ErroApp>>;
}