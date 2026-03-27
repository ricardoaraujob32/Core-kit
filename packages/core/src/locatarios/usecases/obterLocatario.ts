// packages/core/src/locatarios/usecases/obterLocatario.ts

import type { ObterLocatarioInput, ObterLocatarioOutput, ObterLocatarioResult } from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { validarLocatarioId } from "../validadores";
import { locatarioNaoEncontrado } from "../erros";
import { wrapOk } from "../../kernel";
import { transicionarEstadoLocatario } from "../maquinaEstados";

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
export function createFnObterLocatario(deps: { locatarioRepositorio: LocatariosRepositorio }) {
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
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const res = await deps.locatarioRepositorio.buscarPorId({
      locatarioId: locatarioId.value,
    });
    if (!res.ok) return res;

    const loc = res.value;
    if (!loc) return locatarioNaoEncontrado(locatarioId.value);

    const transicao = transicionarEstadoLocatario({
      locatarioId: loc.locatarioId,
      statusAtual: loc.status,
      evento: "OPERAR",
    });
    if (!transicao.ok) return transicao;

    return wrapOk<ObterLocatarioOutput>({
      locatario: loc,
    });
  };
}
