// packages/core/src/usuarios/usecases/inativarUsuario.ts

import { validarUsuarioId } from "../validadores";
import { usuarioNaoEncontrado } from "../erros";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { InativarUsuarioInput, InativarUsuarioOutput, InativarUsuarioResult } from "../tipos";
import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel";
import { validarLocatarioId } from "../../locatarios";
import { transicionarEstadoUsuario } from "../maquinaEstados";

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
  usuariosRepositorio: UsuariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
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
  return async function inativarUsuario(input: InativarUsuarioInput): InativarUsuarioResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.usuariosRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
        usuarioId: usuarioId.value,
      });
      if (!atual.ok) return atual;
      if (!atual.value || atual.value.excluidoEm) {
        return usuarioNaoEncontrado(usuarioId.value);
      }

      const transicao = transicionarEstadoUsuario({
        usuarioId: atual.value.usuarioId,
        statusAtual: atual.value.status,
        evento: "INATIVAR",
      });
      if (!transicao.ok) return transicao;

      const atualizado = await deps.usuariosRepositorio.atualizar({
        ...atual.value,
        status: transicao.value,
        atualizadoEm: deps.relogio.agora(),
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<InativarUsuarioOutput>({
        usuario: atualizado.value,
      });
    });
  };
}

