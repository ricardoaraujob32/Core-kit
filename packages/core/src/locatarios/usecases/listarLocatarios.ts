// packages/core/src/locatarios/usecases/listarLocatarios.ts

import type { ListarLocatariosInput, ListarLocatariosOutput, ListarLocatariosResult } from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { wrapOk } from "../../kernel";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas";

/**
 * Cria a função de caso de uso responsável por listar locatários.
 *
 * Este caso de uso atua como uma orquestração simples sobre a porta de
 * repositório, delegando a consulta e apenas adaptando o retorno para o
 * contrato de saída do módulo.
 *
 * Dependências:
 * - `locRepo`: fonte de dados de locatários.
 *
 * @param deps Dependências externas necessárias para o caso de uso.
 * @returns Função `listarLocatarios` pronta para execução.
 */
export function createFnListarLocatarios(deps: { 
  locatariosRepositorio: LocatariosRepositorio;
  politicaSeguranca?: PoliticaSegurancaLocatariosPorta;
}) {
  /**
   * Executa o caso de uso de listagem de locatários.
   *
   * Fluxo:
   * 1. consulta o repositório;
   * 2. propaga falhas do repositório;
   * 3. adapta o resultado para `{ itens }`.
   *
   * @returns `Ok({ itens })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function listarLocatarios(input: ListarLocatariosInput): ListarLocatariosResult {
    const autorizacao = await autorizarLocatario(deps, {
      operacao: "LOCATARIO_LISTAR",
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    const resultado = await deps.locatariosRepositorio.listar();
    if (!resultado.ok) return resultado;

    return wrapOk<ListarLocatariosOutput>({
      itens: [...resultado.value].sort((a, b) => a.nome.localeCompare(b.nome)),
    });
  };
}