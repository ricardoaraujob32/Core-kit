// packages/core/src/auditoria/usecases/registrarEventoLocatario.ts

import { ErroApp, Result } from "../../kernel";
import { EventoAuditoriaLocatario, RegistrarEventoLocatarioInput } from "../tipos";
import { validarRegistrarEventoLocatarioInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por registrar eventos de auditoria
 * no escopo de um locatário.
 *
 * Este caso de uso cobre ações de negócio, operação e segurança associadas
 * diretamente a um locatário específico.
 */

/**
 * Cria a função de caso de uso para registrar eventos de auditoria de locatário.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo o repositório de auditoria de locatário.
 * @returns Função de caso de uso `registrarEventoLocatario`.
 */
export function createFnRegistrarEventoLocatario(deps: {
  auditoriaLocatarioRepositorio: AuditoriaLocatarioRepositorio;
}) {
    /**
 * Registra um evento de auditoria no escopo de locatário.
 *
 * Fluxo:
 * - valida a entrada;
 * - delega o registro ao repositório de auditoria de locatário.
 *
 * @param input Dados do evento de auditoria a ser registrado.
 * @returns `Ok(eventoRegistrado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function registrarEventoLocatario(input: RegistrarEventoLocatarioInput): Promise<Result<EventoAuditoriaLocatario, ErroApp>> {
    const validacao = validarRegistrarEventoLocatarioInput(input);
    if (!validacao.ok) return validacao;

    return deps.auditoriaLocatarioRepositorio.registrarEvento(input);
  };
}
