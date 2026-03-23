// packages/core/src/auditoria/usecases/listarAuditoriaPlataforma.ts

import { ErroApp, Result } from "../../kernel";
import { EventoAuditoriaPlataforma, ListarAuditoriaPlataformaInput } from "../tipos";
import { validarListarAuditoriaPlataformaInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por listar eventos de auditoria
 * no escopo de plataforma.
 *
 * Este caso de uso permite consultar o histórico de eventos administrativos
 * e operacionais globais do sistema.
 */

/**
 * Cria a função de caso de uso para listar auditoria de plataforma.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo o repositório de auditoria de plataforma.
 * @returns Função de caso de uso `listarAuditoriaPlataforma`.
 */
export function createFnListarAuditoriaPlataforma(deps: {
  auditoriaPlataformaRepositorio: AuditoriaPlataformaRepositorio;
}) {
    /**
 * Lista eventos de auditoria no escopo de plataforma.
 *
 * Fluxo:
 * - valida a entrada;
 * - delega a consulta ao repositório de auditoria de plataforma.
 *
 * @param input Dados e filtros de consulta da auditoria.
 * @returns `Ok(listaDeEventos)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function listarAuditoriaPlataforma(input: ListarAuditoriaPlataformaInput): Promise<Result<EventoAuditoriaPlataforma[], ErroApp>> {
    const validacao = validarListarAuditoriaPlataformaInput(input);
    if (!validacao.ok) return validacao;

    return deps.auditoriaPlataformaRepositorio.listarEventos(input);
  };
}
