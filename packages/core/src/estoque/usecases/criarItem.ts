// packages/core/src/estoque/usecases/criarItemCatalogo.ts
// Finalidade: Criação de item de catálogo (PRODUTO/SERVICO) com validação e RBAC.

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioEstoque } from "../portasRepositorio";
import type { TipoItem } from "../tipos";
import { nomeItemValido, normalizarNomeItem } from "../validadores";

export async function criarItem(
  ctx: ContextoExecucao,
  dependencias: { estoqueRepo: RepositorioEstoque },
  input: { tipo: TipoItem; nome: string },
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "ESTOQUE_CRIAR_ITEM");
  if (!auth.ok) return auth;

  const nome = normalizarNomeItem(input.nome);
  if (!nomeItemValido(nome)) return wrapErr(erroApp("VALIDACAO", "Nome inválido"));

  const existente = await dependencias.estoqueRepo.obterItemPorNome(ctx.locatarioId, nome);
  if (existente) return wrapErr(erroApp("CONFLITO", "Já existe item com este nome"));

  const criado = await dependencias.estoqueRepo.criarItem({ locatarioId: ctx.locatarioId, tipo: input.tipo, nome });
  return wrapOk({ id: criado.id });
}
