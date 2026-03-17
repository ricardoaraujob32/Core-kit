// packages/core/src/rbac/portasRepositorio.ts

import { ErroApp } from "../erros";
import { Result } from "../result";

export interface RbacRepositorio {
  listarPapeisDoUsuario(params: {
    locatarioId: string;
    usuarioId: string;
  }): Promise<Result<string[], ErroApp>>;

  listarPermissoesEfetivasDoUsuario(params: {
    locatarioId: string;
    usuarioId: string;
  }): Promise<Result<string[], ErroApp>>;
}