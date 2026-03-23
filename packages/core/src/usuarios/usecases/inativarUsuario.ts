// packages/core/src/usuarios/usecases/inativarUsuario.ts

import { validarUsuarioId } from "../validadores";
import { usuarioNaoEncontrado } from "../erros";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { InativarUsuarioInput, ResultadoInativarUsuario } from "../tipos";
import type { RelogioPorta } from "../../kernel";

/**
 * Cria a função de caso de uso responsável por marcar um usuário como inativo.
 *
 * Este caso de uso:
 * - valida `usuarioId`;
 * - carrega o usuário atual;
 * - falha se o usuário não existir ou estiver logicamente excluído;
 * - altera o status para `"INATIVO"`;
 * - atualiza o timestamp `atualizadoEm`;
 * - persiste a nova versão da entidade.
 *
 * Dependências:
 * - `usuariosRepo`: consulta e persistência de usuários;
 * - `relogio`: materialização do instante de atualização.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `inativarUsuario` pronta para receber a entrada do caso de uso.
 */
export function createFnInativarUsuario(deps: {
  usuariosRepo: UsuariosRepositorio;
  relogio: RelogioPorta;
}) {
  /**
   * Executa o caso de uso de inativação de usuário.
   *
   * Fluxo:
   * 1. valida `usuarioId`;
   * 2. busca o usuário atual;
   * 3. falha se o usuário não existir ou estiver excluído;
   * 4. altera o status para `"INATIVO"`;
   * 5. persiste a atualização.
   *
   * @param input Identificador do usuário a ser inativado.
   * @returns `Ok(usuarioAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function inativarUsuario(input: InativarUsuarioInput): ResultadoInativarUsuario {
    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const atual = await deps.usuariosRepo.buscarPorId({
      usuarioId: usuarioId.value,
    });
    if (!atual.ok) return atual;
    if (!atual.value || atual.value.excluidoEm) {
      return usuarioNaoEncontrado(usuarioId.value);
    }

    return deps.usuariosRepo.atualizar({
      ...atual.value,
      status: "INATIVO",
      atualizadoEm: deps.relogio.agora(),
    });
  };
}
