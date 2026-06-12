// packages/core/src/locatarios/usecases/obterLocatario.ts

import type { ObterLocatarioInput, ObterLocatarioOutput, ObterLocatarioResult } from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { wrapOk } from "../../kernel";
import { exigirEstadoOperacionalLocatario } from "../maquinaEstados";
import { obterLocatarioObrigatorio } from "./helpers";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas";

/**
 * Cria a função de caso de uso responsável por obter um locatário por ID.
 *
 * Este caso de uso:
 * - valida o identificador informado;
 * - consulta o repositório;
 * - retorna erro específico quando o locatário não existe;
 * - bloqueia acesso a locatários suspensos ou encerrados;
 * - devolve a entidade apenas quando ela está em estado operacional compatível.
 *
 * Dependências:
 * - `locRepo`: fonte de consulta do agregado de locatários.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `obterLocatario` pronta para receber a entrada do caso de uso.
 */
export function createFnObterLocatario(deps: { 
  locatariosRepositorio: LocatariosRepositorio,
  politicaSeguranca?: PoliticaSegurancaLocatariosPorta;
 }) {
  /**
   * Executa o caso de uso de obtenção de locatário.
   *
   * Fluxo:
   * 1. valida `locatarioId`;
   * 2. consulta o repositório;
   * 3. falha com `locatarioNaoEncontrado` quando ausente;
   * 4. falha com erro específico quando o status for `SUSPENSO` ou `ENCERRADO`;
   * 5. devolve o locatário quando disponível para uso.
   *
   * @param input Identificador do locatário a ser consultado.
   * @returns `Ok(locatario)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function obterLocatario(input: ObterLocatarioInput): ObterLocatarioResult {
    const locatario = await obterLocatarioObrigatorio({
      locatariosRepositorio: deps.locatariosRepositorio,
      locatarioId: input.locatarioId,
    });
    if (!locatario.ok) return locatario;

    const estadoOperacional = exigirEstadoOperacionalLocatario(locatario.value);
    if (!estadoOperacional.ok) return estadoOperacional;

    const autorizacao = await autorizarLocatario(deps, {
      operacao: "LOCATARIO_OBTER",
      locatarioId: locatario.value.locatarioId,
      locatario: locatario.value,
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    return wrapOk<ObterLocatarioOutput>({
      locatario: locatario.value,
    });
  };
}
