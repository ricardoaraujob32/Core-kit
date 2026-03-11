import type { Result } from "../result";
import type { ErroApp } from "../erros";
import type { ModuloHabilitado } from "./tipos";
import { LocatarioId } from "../locatarios";

export interface ModulosHabilitadosRepositorio {
  listarPorLocatario(
    locatarioId: LocatarioId,
  ): Promise<Result<ModuloHabilitado[], ErroApp>>;
}