import { wrapOk } from "../../result";
import type { ListarUsuariosPorLocatarioInput, ListarUsuariosPorLocatarioOutput, ResultadoListarUsuariosPorLocatario } from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import { validarLocatarioId } from "../../locatarios";


export function createListarUsuariosPorLocatario(deps: {
  usuariosRepo: UsuariosRepositorio;
}) {
  return async function listarUsuariosPorLocatario(
    input: ListarUsuariosPorLocatarioInput,
  ): ResultadoListarUsuariosPorLocatario {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const res = await deps.usuariosRepo.listarPorLocatario({
      locatarioId: locatarioId.value,
    });
    if (!res.ok) return res;

    return wrapOk<ListarUsuariosPorLocatarioOutput>({
      itens: res.value,
    });
  };
}