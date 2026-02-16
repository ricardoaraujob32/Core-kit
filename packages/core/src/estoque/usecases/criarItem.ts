import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import { erroApp, type ErroApp } from "../../erros";
import type { NovoItem } from "../tipos";
import type { RepositorioItens } from "../portas";
import { validarNovoItem } from "../validadores";

type ContextoEstoque = {
  locatarioId: string;
  permissoes: string[];
};

function exigirPermissaoEscrita(ctx: ContextoEstoque): ErroApp | null {
  if (ctx.permissoes?.includes("ESTOQUE_ESCRITA")) return null;
  return erroApp("NAO_AUTORIZADO", "Permissões insuficientes");
}

export async function criarItem(
  ctx: ContextoEstoque,
  repositorioItens: RepositorioItens,
  novoItem: NovoItem
): Promise<Result<{ id: string }, ErroApp>> {
  const perm = exigirPermissaoEscrita(ctx);
  if (perm) return wrapErr(perm);

  const validacao = validarNovoItem(novoItem);
  if (validacao) return wrapErr(validacao);

  return repositorioItens.criarItem({
    ...novoItem,
    nome: novoItem.nome.trim(),
    unidade: novoItem.unidade.trim(),
    sku: novoItem.sku?.trim() ?? null,
  });
}
