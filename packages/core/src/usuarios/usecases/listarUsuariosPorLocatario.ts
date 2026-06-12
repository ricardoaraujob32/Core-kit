// packages/core/src/usuarios/usecases/listarUsuariosPorLocatario.ts

import { wrapOk } from "../../kernel";
import type { ListarUsuariosPorLocatarioInput, ListarUsuariosPorLocatarioOutput, ListarUsuariosPorLocatarioResult } from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import { validarLocatarioId } from "../../locatarios";
import { autorizarUsuario, PoliticaSegurancaUsuariosPorta } from "../politicas";

/**
 * Cria a função de caso de uso responsável por listar usuários de um locatário.
 *
 * Este caso de uso:
 * - valida `locatarioId`;
 * - delega a consulta ao repositório;
 * - adapta o retorno para o contrato público `{ itens }`.
 *
 * Dependências:
 * - `usuariosRepo`: fonte de consulta dos usuários por locatário.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `listarUsuariosPorLocatario` pronta para receber a entrada do caso de uso.
 */
export function createFnListarUsuariosPorLocatario(deps: { 
  usuariosRepositorio: UsuariosRepositorio;
  politicaSeguranca?: PoliticaSegurancaUsuariosPorta; 
}) {
  /**
   * Executa o caso de uso de listagem de usuários por locatário.
   *
   * Fluxo:
   * 1. valida `locatarioId`;
   * 2. consulta o repositório;
   * 3. adapta o resultado para o contrato de saída do módulo.
   *
   * @param input Locatário alvo da consulta.
   * @returns `Ok({ itens })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function listarUsuariosPorLocatario(input: ListarUsuariosPorLocatarioInput): ListarUsuariosPorLocatarioResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const autorizacao = await autorizarUsuario(deps, {
      operacao: "USUARIO_LISTAR",
      locatarioId: locatarioId.value,
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    const res = await deps.usuariosRepositorio.listarPorLocatario({
      locatarioId: locatarioId.value,
    });
    if (!res.ok) return res;

    return wrapOk<ListarUsuariosPorLocatarioOutput>({
      itens: res.value,
    });
  };
}
