// packages/core/src/usuarios/usecases/reativarUsuario.ts

import { validarUsuarioId } from "../validadores";
import { usuarioNaoEncontrado } from "../erros";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { ReativarUsuarioInput, ResultadoReativarUsuario } from "../tipos";
import type { RelogioPorta } from "../../kernel";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnReativarUsuario(deps: {
  usuariosRepo: UsuariosRepositorio;
  relogio: RelogioPorta;
}) {
  return async function reativarUsuario(input: ReativarUsuarioInput): ResultadoReativarUsuario {
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
      status: "ATIVO",
      atualizadoEm: deps.relogio.agora(),
    });
  };
}