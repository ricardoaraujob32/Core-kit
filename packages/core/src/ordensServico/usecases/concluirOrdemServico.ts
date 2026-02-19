// packages/core/src/ordensServico/usecases/concluirOrdemServico.ts
// Finalidade: Concluir OS.

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioOrdensServico } from "../portasRepositorio";

export async function concluirOrdemServico(
  ctx: ContextoExecucao,
  dependencias: { osRepo: RepositorioOrdensServico },
  input: { osId: string },
): Promise<Result<{ ok: true }, ErroApp>> {
  const auth = exigirPermissao(ctx, "OS_CONCLUIR");
  if (!auth.ok) return auth;

  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  const os = await dependencias.osRepo.obterPorId(ctx.locatarioId, input.osId);
  if (!os) return wrapErr(erroApp("NAO_ENCONTRADO", "OS não encontrada"));

  if (os.status === "CANCELADA") return wrapErr(erroApp("VALIDACAO", "OS cancelada não pode ser concluída"));
  if (os.status === "CONCLUIDA") return wrapErr(erroApp("VALIDACAO", "OS já concluída"));

  os.status = "CONCLUIDA";
  os.atualizadaEm = (ctx.agora ?? (() => new Date()))();

  await dependencias.osRepo.salvar(os);

  return wrapOk({ ok: true });
}
