// packages/core/src/usuarios/usecases/listarUsuarios.ts
// Finalidade: Caso de uso de listagem de usuários (somente domínio + ROP).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import type { ErroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";
import type { RepositorioUsuarios } from "../portasRepositorio";
import type { Usuario } from "../tipos";

export async function listarUsuarios(ctx: ContextoExecucao, dependencias: { usuariosRepo: RepositorioUsuarios },): Promise<Result<{ itens: Usuario[] }, ErroApp>> {
  const auth = exigirPermissao(ctx, "USUARIOS_LER");
  if (!auth.ok) return auth;

  const itens = await dependencias.usuariosRepo.listar(ctx.locatarioId);
  return { ok: true, value: { itens } };
}
