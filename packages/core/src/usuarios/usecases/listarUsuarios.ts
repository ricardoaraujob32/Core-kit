// packages/core/src/usuarios/usecases/listarUsuarios.ts

import type { Result } from "@core-kit/core";
import { err, ok } from "@core-kit/core";

import { appError } from "@core-kit/core";
import type { ContextoExecucao } from "@core-kit/core";
import type { UsuariosRepo } from "../repo";
import type { Usuario } from "../types";

type Deps = {
  usuariosRepo: UsuariosRepo;
};

export async function listarUsuarios(
  ctx: ContextoExecucao,
  deps: Deps,
): Promise<Result<Usuario[], ReturnType<typeof appError>>> {
  if (!ctx.locatarioId) {
    return err(appError("UNAUTHORIZED", "Locatário ausente no contexto."));
  }

  const usuarios = await deps.usuariosRepo.list();
  return ok(usuarios);
}
