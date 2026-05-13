// packages/core/src/usuarios/usecases/obterUsuario.ts

import { wrapOk } from "../../kernel";
import type { ObterUsuarioInput, ObterUsuarioOutput, ObterUsuarioResult } from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import { exigirEstadoOperacionalUsuario } from "../maquinaEstados";
import { autorizarUsuario, PoliticaSegurancaUsuariosPorta } from "../politicas";
import { obterUsuarioObrigatorio } from "./helpers";

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
export function createFnObterUsuario(deps: { 
  usuariosRepositorio: UsuariosRepositorio;
  politicaSeguranca?: PoliticaSegurancaUsuariosPorta;
}) {
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
    const usuario = await obterUsuarioObrigatorio({
      usuariosRepositorio: deps.usuariosRepositorio,
      locatarioId: input.locatarioId,
      usuarioId: input.usuarioId,
    });
    if (!usuario.ok) return usuario;

    const autorizacao = await autorizarUsuario(deps, {
      operacao: "USUARIO_OBTER",
      locatarioId: usuario.value.locatarioId,
      usuarioId: usuario.value.usuarioId,
      usuario: usuario.value,
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    const operacional = exigirEstadoOperacionalUsuario(usuario.value);
    if (!operacional.ok) return operacional;

    return wrapOk<ObterUsuarioOutput>({
      usuario: usuario.value,
    });
  };
}
