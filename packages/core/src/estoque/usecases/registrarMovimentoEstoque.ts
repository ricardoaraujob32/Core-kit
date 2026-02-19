// packages/core/src/estoque/usecases/registrarMovimentoEstoque.ts
// Finalidade: Registrar movimento mínimo (ENTRADA/SAIDA/AJUSTE) no estoque padrão (automático) ou informado.

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioEstoque } from "../portasRepositorio";
import type { EstoqueId, ItemCatalogoId, TipoMovimentoEstoque } from "../tipos";
import { quantidadeValida } from "../validadores";

export async function registrarMovimentoEstoque(
  ctx: ContextoExecucao,
  dependencias: { estoqueRepo: RepositorioEstoque },
  input: { estoqueId?: EstoqueId; itemId: ItemCatalogoId; tipo: TipoMovimentoEstoque; quantidade: number; motivo?: string },
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "ESTOQUE_MOVIMENTAR");
  if (!auth.ok) return auth;

  // (opção A) não aceitar usuário nulo: se não houver usuário, considera não autenticado
  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  if (!quantidadeValida(input.quantidade)) return wrapErr(erroApp("VALIDACAO", "Quantidade inválida"));

  const item = await dependencias.estoqueRepo.obterItemPorId(ctx.locatarioId, input.itemId);
  if (!item) return wrapErr(erroApp("NAO_ENCONTRADO", "Item não encontrado"));

  if (item.tipo === "SERVICO") {
    return wrapErr(erroApp("VALIDACAO", "Serviços não possuem movimentação de estoque"));
  }

  let estoqueId = input.estoqueId;
  if (!estoqueId) {
    const existente = await dependencias.estoqueRepo.obterEstoquePadrao(ctx.locatarioId);
    const padrao = existente ?? (await dependencias.estoqueRepo.criarEstoquePadrao(ctx.locatarioId));
    estoqueId = padrao.id;
  }

  // Regra MVP: saída não pode deixar saldo negativo
  if (input.tipo === "SAIDA") {
    const saldo = await dependencias.estoqueRepo.obterSaldoAtual(ctx.locatarioId, estoqueId, input.itemId);
    if (saldo - input.quantidade < 0) {
      return wrapErr(erroApp("VALIDACAO", "Saldo insuficiente"));
    }
  }

  const mov = await dependencias.estoqueRepo.registrarMovimento({
    locatarioId: ctx.locatarioId,
    estoqueId,
    itemId: input.itemId,
    tipo: input.tipo,
    quantidade: input.quantidade,
    motivo: input.motivo,
    usuarioId: ctx.usuarioId,
    criadoEm: (ctx.agora ?? (() => new Date()))(),
  });

  return wrapOk({ id: mov.id });
}
