// packages/core/src/usuarios/usecases/alterarSenhaUsuario.ts

import type { HashAuthPorta } from "../../auth/portasServico";
import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import { senhaAtualInvalida, usuarioNaoEncontrado } from "../erros";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { AlterarSenhaUsuarioInput, AlterarSenhaUsuarioOutput, AlterarSenhaUsuarioResult } from "../tipos";
import { validarLocatarioId } from "../../locatarios";
import { validarUsuarioId } from "../validadores";
import { validarSenha } from "../../auth/validadores";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAlterarSenhaUsuario(deps: {
  usuariosRepositorio: UsuariosRepositorio;
  hashPorta: HashAuthPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   */
  return async function alterarSenhaUsuario(input: AlterarSenhaUsuarioInput): AlterarSenhaUsuarioResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const senhaAtual = validarSenha(input.senhaAtual);
    if (!senhaAtual.ok) return senhaAtual;

    const novaSenha = validarSenha(input.novaSenha);
    if (!novaSenha.ok) return novaSenha;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.usuariosRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
        usuarioId: usuarioId.value,
      });
      if (!atual.ok) return atual;
      if (!atual.value || atual.value.excluidoEm) {
        return usuarioNaoEncontrado(usuarioId.value);
      }

      const senhaOk = await deps.hashPorta.compararSenha(
        senhaAtual.value,
        atual.value.senhaHash,
      );
      if (!senhaOk.ok) return senhaOk;
      if (!senhaOk.value) {
        return senhaAtualInvalida(usuarioId.value);
      }

      const novoHash = await deps.hashPorta.gerarHashSenha(novaSenha.value);
      if (!novoHash.ok) return novoHash;

      const persistencia = await deps.usuariosRepositorio.atualizarSenha({
        locatarioId: locatarioId.value,
        usuarioId: usuarioId.value,
        senhaHash: novoHash.value,
        atualizadoEm: deps.relogio.agora(),
      });
      if (!persistencia.ok) return persistencia;

      return wrapOk<AlterarSenhaUsuarioOutput>({
        usuarioId: usuarioId.value,
      });
    });
  };
}
