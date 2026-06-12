// packages/core/src/usuarios/usecases/desativarUsuario.ts

import type { UsuariosRepositorio } from "../portasRepositorio.js";
import type { DesativarUsuarioInput, DesativarUsuarioOutput, DesativarUsuarioResult } from "../tipos.js";
import { wrapOk, RelogioPorta, TransacaoPorta } from "../../kernel/index.js";
import { executarEmTransacao } from "../../kernel/index.js";
import { transicionarEstadoUsuario } from "../maquinaEstados.js";
import { autorizarUsuario, PoliticaSegurancaUsuariosPorta } from "../politicas.js";
import { obterUsuarioObrigatorio } from "./helpers.js";

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
export function createFnDesativarUsuario(deps: {
  usuariosRepositorio: UsuariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaUsuariosPorta;
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
  return async function desativarUsuario(input: DesativarUsuarioInput): DesativarUsuarioResult {
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await obterUsuarioObrigatorio({
        usuariosRepositorio: deps.usuariosRepositorio,
        locatarioId: input.locatarioId,
        usuarioId: input.usuarioId,
      });
      if (!atual.ok) return atual;

      const autorizacao = await autorizarUsuario(deps, {
        operacao: "USUARIO_DESATIVAR",
        locatarioId: atual.value.locatarioId,
        usuarioId: atual.value.usuarioId,
        usuario: atual.value,
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

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

      return wrapOk<DesativarUsuarioOutput>({
        usuario: atualizado.value,
      });
    });
  };
}
