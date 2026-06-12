// packages/core/src/usuarios/usecases/atualizarUsuario.ts

import { validarEmailUsuario, validarNomeUsuario } from "../validadores.js";
import { emailUsuarioJaExiste } from "../erros.js";
import type { UsuariosRepositorio } from "../portasRepositorio.js";
import type { AtualizarUsuarioInput, AtualizarUsuarioOutput, AtualizarUsuarioResult } from "../tipos.js";
import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel/index.js";
import { exigirEstadoOperacionalUsuario } from "../maquinaEstados.js";
import { autorizarUsuario, PoliticaSegurancaUsuariosPorta } from "../politicas.js";
import { obterUsuarioObrigatorio } from "./helpers.js";

/**
 * Cria a função de caso de uso responsável por atualizar dados cadastrais
 * de um usuário existente.
 *
 * Este caso de uso:
 * - valida `usuarioId`;
 * - carrega o usuário atual;
 * - impede atualização de usuário inexistente ou logicamente excluído;
 * - permite atualização parcial de nome e e-mail;
 * - revalida os campos que forem informados;
 * - verifica unicidade do novo e-mail dentro do mesmo locatário;
 * - atualiza `atualizadoEm` com o relógio injetado;
 * - persiste a nova versão da entidade.
 *
 * Dependências:
 * - `usuariosRepo`: consulta e persistência de usuários;
 * - `relogio`: materialização do instante de atualização.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `atualizarUsuario` pronta para receber a entrada do caso de uso.
 */
export function createFnAtualizarUsuario(deps: {
  usuariosRepositorio: UsuariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaUsuariosPorta;
}) {
  /**
   * Executa o caso de uso de atualização de usuário.
   *
   * Fluxo:
   * 1. valida `usuarioId`;
   * 2. busca o usuário atual;
   * 3. falha se o usuário não existir ou estiver excluído;
   * 4. revalida `nome` e/ou `email` apenas se informados;
   * 5. garante unicidade do e-mail quando houver alteração;
   * 6. persiste a entidade atualizada.
   *
   * @param input Dados parciais para atualização do usuário.
   * @returns `Ok(usuarioAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function atualizarUsuario(input: AtualizarUsuarioInput): AtualizarUsuarioResult {
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await obterUsuarioObrigatorio({
        usuariosRepositorio: deps.usuariosRepositorio,
        locatarioId: input.locatarioId,
        usuarioId: input.usuarioId,
      });
      if (!atual.ok) return atual;

      const autorizacao = await autorizarUsuario(deps, {
        operacao: "USUARIO_ATUALIZAR",
        locatarioId: atual.value.locatarioId,
        usuarioId: atual.value.usuarioId,
        usuario: atual.value,
        dados: {
          nome: input.nome,
          email: input.email,
        },
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const operacional = exigirEstadoOperacionalUsuario(atual.value);
      if (!operacional.ok) return operacional;

      let nome = atual.value.nome;
      let email = atual.value.email;

      if (input.nome !== undefined) {
        const nomeValidado = validarNomeUsuario(input.nome);
        if (!nomeValidado.ok) return nomeValidado;
        nome = nomeValidado.value;
      }

      if (input.email !== undefined) {
        const emailValidado = validarEmailUsuario(input.email);
        if (!emailValidado.ok) return emailValidado;

        const existente = await deps.usuariosRepositorio.buscarPorEmailNoLocatario({
          locatarioId: atual.value.locatarioId,
          emailNormalizado: emailValidado.value,
        });
        if (!existente.ok) return existente;

        if (existente.value && existente.value.usuarioId !== atual.value.usuarioId) {
          return emailUsuarioJaExiste(emailValidado.value, atual.value.locatarioId);
        }

        email = emailValidado.value;
      }

      const atualizado = await deps.usuariosRepositorio.atualizar({
        ...atual.value,
        nome,
        email,
        atualizadoEm: deps.relogio.agora(),
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<AtualizarUsuarioOutput>({
        usuario: atualizado.value,
      });
    });
  };
}
