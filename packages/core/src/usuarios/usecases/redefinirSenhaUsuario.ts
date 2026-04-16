// packages/core/src/usuarios/usecases/redefinirSenhaUsuario.ts

import type { HashAuthPorta } from "../../auth/portasServico";
import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import { usuarioNaoEncontrado } from "../erros";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { RedefinirSenhaUsuarioInput, RedefinirSenhaUsuarioOutput, RedefinirSenhaUsuarioResult } from "../tipos";
import { validarLocatarioId } from "../../locatarios";
import { validarUsuarioId } from "../validadores";
import { validarSenha } from "../../auth/validadores";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnRedefinirSenhaUsuario(deps: {
  usuariosRepositorio: UsuariosRepositorio;
  hashPorta: HashAuthPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   */
  return async function redefinirSenhaUsuario(input: RedefinirSenhaUsuarioInput): RedefinirSenhaUsuarioResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

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

      const novoHash = await deps.hashPorta.gerarHashSenha(novaSenha.value);
      if (!novoHash.ok) return novoHash;

      const persistencia = await deps.usuariosRepositorio.atualizarSenha({
        locatarioId: locatarioId.value,
        usuarioId: usuarioId.value,
        senhaHash: novoHash.value,
        atualizadoEm: deps.relogio.agora(),
      });
      if (!persistencia.ok) return persistencia;

      return wrapOk<RedefinirSenhaUsuarioOutput>({
        usuarioId: usuarioId.value,
      });
    });
  };
}
