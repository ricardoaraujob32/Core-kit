// packages/core/src/usuarios/usecases/obterUsuario.ts

import { wrapOk } from "../../kernel";
import type { ObterUsuarioInput, ObterUsuarioOutput, ObterUsuarioResult } from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import { validarUsuarioId } from "../validadores";
import { usuarioNaoEncontrado } from "../erros";
import { validarLocatarioId } from "../../locatarios";
import { transicionarEstadoUsuario } from "../maquinaEstados";

/**
 * Cria a função de caso de uso responsável por obter um usuário por ID.
 *
 * Este caso de uso:
 * - valida `usuarioId`;
 * - consulta o repositório;
 * - trata usuário inexistente ou logicamente excluído como não encontrado;
 * - bloqueia retorno de usuários em estados incompatíveis com operação normal;
 * - devolve a entidade apenas quando o estado do usuário é aceitável.
 *
 * Dependências:
 * - `usuariosRepo`: fonte de consulta do agregado de usuários.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `obterUsuario` pronta para receber a entrada do caso de uso.
 */
export function createFnObterUsuario(deps: { usuariosRepositorio: UsuariosRepositorio }) {
  /**
   * Executa o caso de uso de obtenção de usuário.
   *
   * Fluxo:
   * 1. valida `usuarioId`;
   * 2. consulta o repositório;
   * 3. falha com `usuarioNaoEncontrado` se o usuário não existir ou estiver excluído;
   * 4. falha com erro específico quando o status for `INATIVO`, `SUSPENSO` ou `ENCERRADO`;
   * 5. devolve o usuário quando ele estiver em estado operacional compatível.
   *
   * @param input Identificador do usuário a ser consultado.
   * @returns `Ok(usuario)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function obterUsuario(input: ObterUsuarioInput): ObterUsuarioResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const res = await deps.usuariosRepositorio.buscarPorId({
      locatarioId: locatarioId.value,
      usuarioId: usuarioId.value,
    });
    if (!res.ok) return res;

    const usuario = res.value;
    if (!usuario || usuario.excluidoEm) {
      return usuarioNaoEncontrado(usuarioId.value);
    }

    const transicao = transicionarEstadoUsuario({
      usuarioId: usuario.usuarioId,
      statusAtual: usuario.status,
      evento: "OPERAR",
    });
    if (!transicao.ok) return transicao;

    return wrapOk<ObterUsuarioOutput>({
      usuario,
    });
  };
}
