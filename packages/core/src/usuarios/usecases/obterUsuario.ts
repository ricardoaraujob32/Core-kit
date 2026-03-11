import type {
  ObterUsuarioInput,
  ResultadoObterUsuario,
} from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import { validarLocatarioId, validarUsuarioId } from "../validadores";
import { usuarioNaoEncontrado } from "../erros";

export function criarObterUsuario(deps: {
  usuariosRepo: UsuariosRepositorio;
}) {
  return async function obterUsuario(
    input: ObterUsuarioInput
  ): ResultadoObterUsuario {
    const loc = validarLocatarioId(input.locatarioId);
    if (!loc.ok) return loc;

    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const res = await deps.usuariosRepo.buscarPorId({
      locatarioId: loc.value,
      usuarioId: usuarioId.value,
    });
    if (!res.ok) return res;

    if (!res.value) {
      return usuarioNaoEncontrado(usuarioId.value);
    }

    return { ok: true, value: res.value };
  };
}