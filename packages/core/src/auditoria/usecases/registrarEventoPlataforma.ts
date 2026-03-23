// packages/core/src/auditoria/usecases/registrarEventoPlataforma.ts

import { ErroApp, Result } from "../../kernel";
import { EventoAuditoriaPlataforma, RegistrarEventoPlataformaInput } from "../tipos";
import { validarRegistrarEventoPlataformaInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por registrar eventos de auditoria
 * no escopo de plataforma.
 *
 * Este caso de uso cobre ações administrativas, operacionais ou sistêmicas
 * que não pertencem diretamente ao escopo de um locatário específico.
 */

/**
 * Cria a função de caso de uso para registrar eventos de auditoria de plataforma.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo o repositório de auditoria de plataforma.
 * @returns Função de caso de uso `registrarEventoPlataforma`.
 */
export function createFnRegistrarEventoPlataforma(deps: {
  auditoriaPlataformaRepositorio: AuditoriaPlataformaRepositorio;
}) {
    /**
 * Registra um evento de auditoria no escopo de plataforma.
 *
 * Fluxo:
 * - valida a entrada;
 * - delega o registro ao repositório de auditoria de plataforma.
 *
 * @param input Dados do evento de auditoria a ser registrado.
 * @returns `Ok(eventoRegistrado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function registrarEventoPlataforma(input: RegistrarEventoPlataformaInput): Promise<Result<EventoAuditoriaPlataforma, ErroApp>> {
    const validacao = validarRegistrarEventoPlataformaInput(input);
    if (!validacao.ok) return validacao;

    return deps.auditoriaPlataformaRepositorio.registrarEvento(input);
  };
}
