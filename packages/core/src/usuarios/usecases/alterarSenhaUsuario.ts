// packages/core/src/usuarios/usecases/alterarSenhaUsuario.ts

import type { HashPorta } from "../../kernel";
import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import { senhaAtualInvalida } from "../erros";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { AlterarSenhaUsuarioInput, AlterarSenhaUsuarioOutput, AlterarSenhaUsuarioResult } from "../tipos";
import { validarSenhaUsuario } from "../validadores";
import { autorizarUsuario, PoliticaSegurancaUsuariosPorta } from "../politicas";
import { exigirEstadoOperacionalUsuario } from "../maquinaEstados";
import { obterUsuarioObrigatorio } from "./helpers";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAlterarSenhaUsuario(deps: {
  usuariosRepositorio: UsuariosRepositorio;
  hashPorta: HashPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaUsuariosPorta;
}) {
  /**
   * 
   */
  return async function alterarSenhaUsuario(input: AlterarSenhaUsuarioInput): AlterarSenhaUsuarioResult {
    const senhaAtual = validarSenhaUsuario(input.senhaAtual);
    if (!senhaAtual.ok) return senhaAtual;

    const novaSenha = validarSenhaUsuario(input.novaSenha);
    if (!novaSenha.ok) return novaSenha;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await obterUsuarioObrigatorio({
        usuariosRepositorio: deps.usuariosRepositorio,
        locatarioId: input.locatarioId,
        usuarioId: input.usuarioId,
      });
      if (!atual.ok) return atual;

      const autorizacao = await autorizarUsuario(deps, {
        operacao: "USUARIO_ALTERAR_SENHA",
        locatarioId: atual.value.locatarioId,
        usuarioId: atual.value.usuarioId,
        usuario: atual.value,
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const operacional = exigirEstadoOperacionalUsuario(atual.value);
      if (!operacional.ok) return operacional;

      const senhaOk = await deps.hashPorta.comparar(senhaAtual.value, atual.value.senhaHash);
      if (!senhaOk) {
        return senhaAtualInvalida(atual.value.usuarioId);
      }

      const novoHash = await deps.hashPorta.gerarHash(novaSenha.value);

      const persistencia = await deps.usuariosRepositorio.atualizarSenha({
        locatarioId: input.locatarioId,
        usuarioId: atual.value.usuarioId,
        senhaHash: novoHash,
        atualizadoEm: deps.relogio.agora(),
      });
      if (!persistencia.ok) return persistencia;

      return wrapOk<AlterarSenhaUsuarioOutput>({
        usuarioId: atual.value.usuarioId,
      });
    });
  };
}
