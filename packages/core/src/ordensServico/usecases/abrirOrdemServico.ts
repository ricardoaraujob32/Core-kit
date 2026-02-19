// packages/core/src/ordensServico/usecases/abrirOrdemServico.ts
// Finalidade: Abrir OS no status ABERTA.

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioOrdensServico } from "../portasRepositorio";

export async function abrirOrdemServico(
  ctx: ContextoExecucao,
  dependencias: { osRepo: RepositorioOrdensServico },
  input: { titulo: string },
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "OS_ABRIR");
  if (!auth.ok) return auth;

  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  const titulo = String(input.titulo ?? "").trim();
  if (titulo.length < 3) return wrapErr(erroApp("VALIDACAO", "Título inválido"));

  const agora = (ctx.agora ?? (() => new Date()))();

  const os = await dependencias.osRepo.criar({
    locatarioId: ctx.locatarioId,
    titulo,
    status: "ABERTA",
    itensServico: [],
    produtosConsumidos: [],
    usuarioId: ctx.usuarioId,
    criadaEm: agora,
    atualizadaEm: agora,
  });

  return wrapOk({ id: os.id });
}
