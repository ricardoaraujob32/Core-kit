// packages/core/src/auditoria/usecases/listarAuditoriaLocatario.ts

import { ErroApp, Result } from "../../kernel";
import { AuditoriaLocatarioRepositorioMemoria } from "../repositorioMemoria";
import { EventoAuditoriaLocatario, ListarAuditoriaLocatarioInput } from "../tipos";
import { validarListarAuditoriaLocatarioInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por listar eventos de auditoria
 * no escopo de um locatário.
 *
 * Este caso de uso permite consultar o histórico de eventos associados
 * a operações realizadas dentro de um locatário específico.
 */

/**
 * Cria a função de caso de uso para listar auditoria de locatário.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo o repositório de auditoria de locatário.
 * @returns Função de caso de uso `listarAuditoriaLocatario`.
 */
export function createFnListarAuditoriaLocatario(deps: {
  auditoriaLocatarioRepositorio: AuditoriaLocatarioRepositorioMemoria;
}) {
   /**
 * Lista eventos de auditoria no escopo de locatário.
 *
 * Fluxo:
 * - valida a entrada;
 * - delega a consulta ao repositório de auditoria de locatário.
 *
 * @param input Dados e filtros de consulta da auditoria.
 * @returns `Ok(listaDeEventos)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function listarAuditoriaLocatario(input: ListarAuditoriaLocatarioInput): Promise<Result<EventoAuditoriaLocatario[], ErroApp>> {
    const validacao = validarListarAuditoriaLocatarioInput(input);
    if (!validacao.ok) return validacao;

    return deps.auditoriaLocatarioRepositorio.listarEventos(input);
  };
}
