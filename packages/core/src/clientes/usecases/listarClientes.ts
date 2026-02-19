// packages/core/src/clientes/usecases/listarClientes.ts
// Finalidade: Caso de uso de listagem de clientes (domínio + ROP + RBAC).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import type { ErroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";
import type { RepositorioClientes } from "../portasRepositorio";
import type { Cliente } from "../tipos";

export async function listarClientes(
  ctx: ContextoExecucao,
  dependencias: { clientesRepo: RepositorioClientes },
): Promise<Result<{ itens: Cliente[] }, ErroApp>> {
  const auth = exigirPermissao(ctx, "CLIENTES_LER");
  if (!auth.ok) return auth;

  const itens = await dependencias.clientesRepo.listar(ctx.locatarioId);
  return { ok: true, value: { itens } };
}
