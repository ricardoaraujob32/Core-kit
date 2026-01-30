/**
 * Arquivo: packages/core/src/usuarios/usecases/criarUsuario.ts
 * Finalidade: Caso de uso para criar um usuário no locatário atual.
 */

import type { Result } from "../../result";
import { err, ok } from "../../result";
import { appError, type AppError } from "../../errors";
import type { ContextoExecucao } from "../../locatario";

import type { RepositorioUsuarios } from "../repositorioUsuarios";
import type { NovoUsuario, Usuario } from "../types";
import { nomeValido, normalizeNome } from "../validators";

export type DependenciasCriarUsuario = {
  repositorioUsuarios: RepositorioUsuarios;
  gerarIdentificadorUsuario: () => string;
};

export async function criarUsuario(
  contextoExecucao: ContextoExecucao,
  dependencias: DependenciasCriarUsuario,
  entrada: NovoUsuario,
): Promise<Result<Usuario, AppError>> {
  const locatarioId = contextoExecucao.locatarioId;
  if (!locatarioId) {
    return err(appError("UNAUTHORIZED", "Locatário ausente no contexto."));
  }

  const nome = normalizeNome(entrada.nome);
  if (!nomeValido(nome)) {
    return err(appError("VALIDATION", "Nome inválido."));
  }

  const usuarioExistente = await dependencias.repositorioUsuarios.buscarUsuarioPorNome(locatarioId, nome);
  if (usuarioExistente) {
    return err(appError("CONFLICT", "Usuário já existe."));
  }

  const usuario: Usuario = {
    id: dependencias.gerarIdentificadorUsuario(),
    nome,
    status: "ATIVO",
  };

  await dependencias.repositorioUsuarios.criarUsuario(locatarioId, usuario);
  return ok(usuario);
}
