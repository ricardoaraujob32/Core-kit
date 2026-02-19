// packages/core/src/transacoes/usecases/criarTransacaoConfirmada.ts
// Finalidade: Criar transação já confirmada e gerar movimentos de estoque (sem triggers).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioEstoque } from "../../estoque/portasRepositorio";
import type { TipoMovimentoEstoque } from "../../estoque/tipos";
import { registrarMovimentoEstoque } from "../../estoque/usecases/registrarMovimentoEstoque";
import { quantidadeValida } from "../../estoque/validadores";

import type { RepositorioTransacoes } from "../portasRepositorio";
import type { ItemTransacao, TipoTransacao } from "../tipos";

export async function criarTransacaoConfirmada(
  ctx: ContextoExecucao,
  dependencias: { estoqueRepo: RepositorioEstoque; transacoesRepo: RepositorioTransacoes },
  input: { tipo: TipoTransacao; itens: ItemTransacao[]; observacao?: string },
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "TRANSACOES_CRIAR");
  if (!auth.ok) return auth;

  // (opção A) não aceitar usuário nulo/ausente
  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  if (!Array.isArray(input.itens) || input.itens.length === 0) {
    return wrapErr(erroApp("VALIDACAO", "Transação deve possuir ao menos um item"));
  }

  for (const it of input.itens) {
    if (typeof it.itemId !== "string" || it.itemId.trim().length === 0) {
      return wrapErr(erroApp("VALIDACAO", "itemId inválido"));
    }
    if (!quantidadeValida(it.quantidade)) {
      return wrapErr(erroApp("VALIDACAO", "Quantidade inválida"));
    }
  }

  // Persistir a transação (confirmada) primeiro
  const criadaEm = (ctx.agora ?? (() => new Date()))();
  const transacao = await dependencias.transacoesRepo.criar({
    locatarioId: ctx.locatarioId,
    tipo: input.tipo,
    status: "CONFIRMADA",
    itens: input.itens,
    observacao: input.observacao,
    usuarioId: ctx.usuarioId,
    criadaEm,
  });

  // Gerar movimentos (apenas para PRODUTO)
  const tipoMovimento: TipoMovimentoEstoque = input.tipo === "COMPRA" ? "ENTRADA" : "SAIDA";

  for (const it of input.itens) {
    const itemCatalogo = await dependencias.estoqueRepo.obterItemPorId(ctx.locatarioId, it.itemId);
    if (!itemCatalogo) return wrapErr(erroApp("NAO_ENCONTRADO", "Item não encontrado"));

    if (itemCatalogo.tipo === "SERVICO") {
      continue; // serviço não movimenta estoque
    }

    const mov = await registrarMovimentoEstoque(ctx, { estoqueRepo: dependencias.estoqueRepo }, {
      itemId: it.itemId,
      tipo: tipoMovimento,
      quantidade: it.quantidade,
      motivo: `Transação ${transacao.id} (${input.tipo})`,
    });

    if (!mov.ok) return mov;
  }

  return wrapOk({ id: transacao.id });
}
