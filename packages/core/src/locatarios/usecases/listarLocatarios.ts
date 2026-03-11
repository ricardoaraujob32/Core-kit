import type {
  ListarLocatariosOutput,
  ResultadoListarLocatarios,
} from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { wrapOk } from "../../result";

export function criarListarLocatarios(deps: {
  locRepo: LocatariosRepositorio;
}) {
  return async function listarLocatarios(): ResultadoListarLocatarios {
    const res = await deps.locRepo.listar();
    if (!res.ok) return res;

    return wrapOk<ListarLocatariosOutput>({
      itens: res.value,
    });
  };
}