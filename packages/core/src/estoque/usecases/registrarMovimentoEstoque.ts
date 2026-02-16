import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import { erroApp, type ErroApp } from "../../erros";
import type { RepositorioEstoque, RepositorioItens } from "../portas";
import type { NovoMovimentoEstoque } from "../tipos";
import { validarNovoMovimentoEstoque } from "../validadores";

type ContextoEstoque = {
  locatarioId: string;
  usuarioId?: string | null;
  permissoes: string[];
};

function exigirPermissaoEscrita(ctx: ContextoEstoque): ErroApp | null {
  if (ctx.permissoes?.includes("ESTOQUE_ESCRITA")) return null;
  return erroApp("NAO_AUTORIZADO", "Permissões insuficientes");
}

export async function registrarMovimentoEstoque(
  ctx: ContextoEstoque,
  repositorioEstoque: RepositorioEstoque,
  repositorioItens: RepositorioItens,
  movimento: NovoMovimentoEstoque
): Promise<Result<{ movimentoId: string }, ErroApp>> {
  const perm = exigirPermissaoEscrita(ctx);
  if (perm) return wrapErr(perm);

  const validacao = validarNovoMovimentoEstoque(movimento);
  if (validacao) return wrapErr(validacao);

  const itemResult = await repositorioItens.buscarItemPorId(movimento.itemId);
  if (!itemResult.ok) return wrapErr(itemResult.error);

  const item = itemResult.value;
  if (!item) return wrapErr(erroApp("NAO_ENCONTRADO", "Item não encontrado."));
  if (item.excluidoEm) return wrapErr(erroApp("INVALIDO", "Item excluído."));
  if (!item.ativo) return wrapErr(erroApp("INVALIDO", "Item inativo."));
  if (item.tipoItem !== "PRODUTO") return wrapErr(erroApp("INVALIDO", "Serviço não gera movimento de estoque."));

  const estoqueId =
    movimento.estoqueId ??
    (await repositorioEstoque.garantirEstoquePadrao()).ok
      ? (await repositorioEstoque.garantirEstoquePadrao()).value.estoqueId
      : null;

  if (!estoqueId) {
    // fallback seguro (se garantirEstoquePadrao falhar)
    const r = await repositorioEstoque.garantirEstoquePadrao();
    if (!r.ok) return wrapErr(r.error);
    return repositorioEstoque.registrarMovimentoEAtualizarSaldo({
      estoqueId: r.value.estoqueId,
      itemId: movimento.itemId,
      tipo: movimento.tipo,
      delta: movimento.delta,
      referencia: movimento.referencia ?? null,
      observacao: movimento.observacao ?? null,
    });
  }

  return repositorioEstoque.registrarMovimentoEAtualizarSaldo({
    estoqueId,
    itemId: movimento.itemId,
    tipo: movimento.tipo,
    delta: movimento.delta,
    referencia: movimento.referencia ?? null,
    observacao: movimento.observacao ?? null,
  });
}
