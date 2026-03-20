// packages/core/src/usuarios/usecases/inativarUsuario.ts

import { validarUsuarioId } from "../validadores";
import { usuarioNaoEncontrado } from "../erros";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { InativarUsuarioInput, ResultadoInativarUsuario } from "../tipos";
import type { RelogioPorta } from "../../kernel";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnInativarUsuario(deps: {
  usuariosRepo: UsuariosRepositorio;
  relogio: RelogioPorta;
}) {
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