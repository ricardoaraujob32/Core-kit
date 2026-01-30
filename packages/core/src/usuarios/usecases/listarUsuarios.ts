/**
 * Arquivo: packages/core/src/usuarios/usecases/listarUsuarios.ts
 * Finalidade: Caso de uso para listar usuários do locatário atual.
 */

import type { Result } from "../../result";
import { err, ok } from "../../result";
import { appError, type AppError } from "../../errors";
import type { ContextoExecucao } from "../../locatario";

import type { RepositorioUsuarios } from "../repositorioUsuarios";
import type { Usuario } from "../types";

export type DependenciasListarUsuarios = {
  repositorioUsuarios: RepositorioUsuarios;
};

export async function listarUsuarios(
  contextoExecucao: ContextoExecucao,
  dependencias: DependenciasListarUsuarios,
): Promise<Result<Usuario[], AppError>> {
  const locatarioId = contextoExecucao.locatarioId;
  if (!locatarioId) {
    return err(appError("UNAUTHORIZED", "Locatário ausente no contexto."));
  }

  const usuarios = await dependencias.repositorioUsuarios.listarUsuarios(locatarioId);
  return ok(usuarios);
}
