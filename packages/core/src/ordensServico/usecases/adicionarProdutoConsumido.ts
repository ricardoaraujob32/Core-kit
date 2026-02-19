// packages/core/src/ordensServico/usecases/adicionarProdutoConsumido.ts
// Finalidade: Adicionar produto consumido e registrar SAIDA no estoque (se PRODUTO).

import type { ContextoExecucao } from "../../contextoExecucao";
import type { Result } from "../../result";
import { wrapErr, wrapOk } from "../../result";
import type { ErroApp } from "../../erros";
import { erroApp } from "../../erros";
import { exigirPermissao } from "../../rbac";

import type { RepositorioOrdensServico } from "../portasRepositorio";
import type { RepositorioEstoque } from "../../estoque/portasRepositorio";
import { registrarMovimentoEstoque } from "../../estoque/usecases/registrarMovimentoEstoque";
import { quantidadeValida } from "../../estoque/validadores";

export async function adicionarProdutoConsumido(
  ctx: ContextoExecucao,
  dependencias: { osRepo: RepositorioOrdensServico; estoqueRepo: RepositorioEstoque },
  input: { osId: string; itemId: string; quantidade: number; motivo?: string },
): Promise<Result<{ id: string }, ErroApp>> {
  const auth = exigirPermissao(ctx, "OS_EDITAR");
  if (!auth.ok) return auth;

  if (ctx.usuarioId === undefined) return wrapErr(erroApp("NAO_AUTENTICADO"));

  if (!quantidadeValida(input.quantidade)) return wrapErr(erroApp("VALIDACAO", "Quantidade inválida"));

  const os = await dependencias.osRepo.obterPorId(ctx.locatarioId, input.osId);
  if (!os) return wrapErr(erroApp("NAO_ENCONTRADO", "OS não encontrada"));

  if (os.status !== "ABERTA" && os.status !== "EM_EXECUCAO") {
    return wrapErr(erroApp("VALIDACAO", "OS não pode ser alterada neste status"));
  }

  const item = await dependencias.estoqueRepo.obterItemPorId(ctx.locatarioId, input.itemId);
  if (!item) return wrapErr(erroApp("NAO_ENCONTRADO", "Item não encontrado"));

  if (item.tipo === "SERVICO") {
    return wrapErr(erroApp("VALIDACAO", "Serviço não pode ser consumido como produto"));
  }

  const mov = await registrarMovimentoEstoque(ctx, { estoqueRepo: dependencias.estoqueRepo }, {
    itemId: input.itemId,
    tipo: "SAIDA",
    quantidade: input.quantidade,
    motivo: input.motivo ?? `Consumo na OS ${os.id}`,
  });
  if (!mov.ok) return mov;

  const id = `prd_${os.produtosConsumidos.length + 1}`;
  os.produtosConsumidos = [
    ...os.produtosConsumidos,
    { id, itemId: input.itemId, quantidade: input.quantidade, motivo: input.motivo },
  ];
  os.atualizadaEm = (ctx.agora ?? (() => new Date()))();

  await dependencias.osRepo.salvar(os);

  return wrapOk({ id });
}
