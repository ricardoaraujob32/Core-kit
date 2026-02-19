// packages/core/src/ordensServico/usecases/adicionarItemServico.ts
// Finalidade: Adicionar item de serviço na OS (não movimenta estoque).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioOrdensServico } from "../portasRepositorio";

export async function adicionarItemServico(
  ctx: ContextoExecucao,
  dependencias: { osRepo: RepositorioOrdensServico },
  input: { osId: string; descricao: string },
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "OS_EDITAR");
  if (!auth.ok) return auth;

  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  const os = await dependencias.osRepo.obterPorId(ctx.locatarioId, input.osId);
  if (!os) return wrapErr(erroApp("NAO_ENCONTRADO", "OS não encontrada"));

  if (os.status !== "ABERTA" && os.status !== "EM_EXECUCAO") {
    return wrapErr(erroApp("VALIDACAO", "OS não pode ser alterada neste status"));
  }

  const descricao = String(input.descricao ?? "").trim();
  if (descricao.length < 3) return wrapErr(erroApp("VALIDACAO", "Descrição inválida"));

  const id = `srv_${os.itensServico.length + 1}`;
  os.itensServico = [...os.itensServico, { id, descricao }];
  os.atualizadaEm = (ctx.agora ?? (() => new Date()))();

  await dependencias.osRepo.salvar(os);

  return wrapOk({ id });
}
