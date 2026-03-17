import type { ErroApp } from "../../kernel/erros";
import type { Result } from "../../kernel/result";
import type {
  ListarAuditoriaLocatarioInput,
  ListarAuditoriaPlataformaInput,
  RegistrarEventoLocatarioInput,
  RegistrarEventoPlataformaInput,
} from "../tipos";
import {
  validarListarAuditoriaLocatarioInput,
  validarListarAuditoriaPlataformaInput,
  validarRegistrarEventoLocatarioInput,
  validarRegistrarEventoPlataformaInput,
} from "../validadores";
import type {
  AuditoriaLocatarioRepositorio,
  AuditoriaPlataformaRepositorio,
} from "../portasRepositorio";

export interface CriarAuditoriaServiceDeps {
  auditoriaLocatarioRepositorio: AuditoriaLocatarioRepositorio;
  auditoriaPlataformaRepositorio: AuditoriaPlataformaRepositorio;
}

export function criarAuditoriaService(deps: CriarAuditoriaServiceDeps) {
  async function registrarEventoLocatario(
    input: RegistrarEventoLocatarioInput,
  ): Promise<Result<any, ErroApp>> {
    const validacao = validarRegistrarEventoLocatarioInput(input);
    if (!validacao.ok) return validacao;
    return deps.auditoriaLocatarioRepositorio.registrarEvento(input);
  }

  async function listarAuditoriaLocatario(
    input: ListarAuditoriaLocatarioInput,
  ): Promise<Result<any, ErroApp>> {
    const validacao = validarListarAuditoriaLocatarioInput(input);
    if (!validacao.ok) return validacao;
    return deps.auditoriaLocatarioRepositorio.listarEventos(input);
  }

  async function registrarEventoPlataforma(
    input: RegistrarEventoPlataformaInput,
  ): Promise<Result<any, ErroApp>> {
    const validacao = validarRegistrarEventoPlataformaInput(input);
    if (!validacao.ok) return validacao;
    return deps.auditoriaPlataformaRepositorio.registrarEvento(input);
  }

  async function listarAuditoriaPlataforma(
    input: ListarAuditoriaPlataformaInput,
  ): Promise<Result<any, ErroApp>> {
    const validacao = validarListarAuditoriaPlataformaInput(input);
    if (!validacao.ok) return validacao;
    return deps.auditoriaPlataformaRepositorio.listarEventos(input);
  }

  return {
    registrarEventoLocatario,
    listarAuditoriaLocatario,
    registrarEventoPlataforma,
    listarAuditoriaPlataforma,
  };
}