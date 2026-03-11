import { wrapOk } from "../../result";
import type {
  ListarUsuariosInput,
  ListarUsuariosOutput,
  ResultadoListarUsuarios,
} from "../tipos";
import type { UsuariosRepositorio } from "../portasRepositorio";
import { validarLimite, validarLocatarioId } from "../validadores";

export function criarListarUsuarios(deps: {
  usuariosRepo: UsuariosRepositorio;
}) {
  return async function listarUsuarios(
    input: ListarUsuariosInput
  ): ResultadoListarUsuarios {
    const loc = validarLocatarioId(input.locatarioId);
    if (!loc.ok) return loc;

    const limite = validarLimite(input.limite);
    if (!limite.ok) return limite;

    const res = await deps.usuariosRepo.listar({
      locatarioId: loc.value,
      limite: limite.value,
      cursor: input.cursor,
    });
    if (!res.ok) return res;

    return wrapOk<ListarUsuariosOutput>({
      itens: res.value,
    });
  };
}