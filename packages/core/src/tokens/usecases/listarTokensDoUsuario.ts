// packages/core/src/tokens/usecases/listarTokensDoUsuario.ts

import { wrapOk } from "../../kernel";
import type { ListarTokensDoUsuarioInput, ListarTokensDoUsuarioOutput, ResultadoListarTokensDoUsuario } from "../tipos";
import type { TokensRepositorio } from "../portasRepositorio";
import { validarUsuarioId } from "../../usuarios";
import { validarLocatarioId } from "../../locatarios";

/**
 * Cria a função de caso de uso responsável por listar tokens de um usuário
 * dentro do escopo de um locatário.
 *
 * Este caso de uso:
 * - valida `usuarioId` e `locatarioId`;
 * - consulta o repositório de tokens;
 * - adapta o retorno para o contrato público `{ itens }`.
 *
 * Dependências:
 * - `tokensRepo`: fonte de consulta dos tokens do usuário.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `listarTokensDoUsuario` pronta para receber a entrada do caso de uso.
 */
export function createFnListarTokensDoUsuario(deps: { tokensRepo: TokensRepositorio }) {
  /**
   * Executa o caso de uso de listagem de tokens do usuário.
   *
   * Fluxo:
   * 1. valida `usuarioId` e `locatarioId`;
   * 2. consulta o repositório;
   * 3. adapta a coleção retornada para o contrato de saída do módulo.
   *
   * @param input Usuário e locatário alvo da consulta.
   * @returns `Ok({ itens })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function listarTokensDoUsuario(input: ListarTokensDoUsuarioInput): ResultadoListarTokensDoUsuario {
    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const res = await deps.tokensRepo.listarPorUsuario({
      usuarioId: usuarioId.value,
      locatarioId: locatarioId.value,
    });
    if (!res.ok) return res;

    return wrapOk<ListarTokensDoUsuarioOutput>({
      itens: res.value,
    });
  };
}
