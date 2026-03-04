import { RbacRepositorio } from "./portasRepositorio";
import { wrapOk } from "../result";

export function criarRbacRepositorioMemoria(data: {
  [key: string]: string[];
}): RbacRepositorio {
  return {
    async listarPermissoesDoUsuario({ locatarioId, usuarioId }) {
      const key = `${locatarioId}:${usuarioId}`;
      return wrapOk(data[key] ?? []);
    },
  };
}