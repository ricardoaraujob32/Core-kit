import { wrapOk } from "../../result";
import type { ObterUsuarioInput, ResultadoObterUsuario } from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import { validarUsuarioId } from "../validadores";
import { usuarioEncerrado, usuarioInativo, usuarioNaoEncontrado, usuarioSuspenso } from "../erros";

export function createObterUsuario(deps: {
  usuariosRepo: UsuariosRepositorio;
}) {
  return async function obterUsuario(
    input: ObterUsuarioInput,
  ): ResultadoObterUsuario {
    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const res = await deps.usuariosRepo.buscarPorId({
      usuarioId: usuarioId.value,
    });
    if (!res.ok) return res;

    const usuario = res.value;
    if (!usuario || usuario.excluidoEm) {
      return usuarioNaoEncontrado(usuarioId.value);
    }

    if (usuario.status === "INATIVO") {
      return usuarioInativo(usuario.usuarioId);
    }

    if (usuario.status === "SUSPENSO") {
      return usuarioSuspenso(usuario.usuarioId);
    }

    if (usuario.status === "ENCERRADO") {
      return usuarioEncerrado(usuario.usuarioId);
    }

    return wrapOk(usuario);
  };
}