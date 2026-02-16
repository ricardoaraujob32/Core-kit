import type { Result } from "../../result";
import { wrapErr } from "../../result";
import { erroApp, type ErroApp } from "../../erros";
import type { RepositorioEstoque } from "../portas";
import type { EstoqueId, ItemId, SaldoEstoque } from "../tipos";

type ContextoEstoque = {
  locatarioId: string;
  permissoes: string[];
};

function exigirPermissaoLeitura(ctx: ContextoEstoque): ErroApp | null {
  if (ctx.permissoes?.includes("ESTOQUE_LEITURA")) return null;
  return erroApp("NAO_AUTORIZADO", "Permissões insuficientes");
}

export async function obterSaldoEstoque(
  ctx: ContextoEstoque,
  repositorioEstoque: RepositorioEstoque,
  params: { itemId: ItemId; estoqueId?: EstoqueId | null }
): Promise<Result<SaldoEstoque, ErroApp>> {
  const perm = exigirPermissaoLeitura(ctx);
  if (perm) return wrapErr(perm);

  let estoqueId = params.estoqueId ?? null;
  if (!estoqueId) {
    const r = await repositorioEstoque.garantirEstoquePadrao();
    if (!r.ok) return wrapErr(r.error);
    estoqueId = r.value.estoqueId;
  }

  return repositorioEstoque.obterSaldo({ estoqueId, itemId: params.itemId });
}
