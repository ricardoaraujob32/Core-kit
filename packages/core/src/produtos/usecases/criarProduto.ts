import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import type { ProdutosRepositorio } from "../portasRepositorio";
import type { CriarProdutoInput, CriarProdutoOutput, CriarProdutoResult } from "../tipos";
import { validarLocatarioId, validarNomeProduto, validarTextoOpcional, validarTipoProduto, validarUnidade, validarValorNaoNegativo, validarValorOpcionalNaoNegativo } from "../validadores";

export function createFnCriarProduto(deps: { produtosRepositorio: ProdutosRepositorio; idPorta: IdPorta; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function criarProduto(input: CriarProdutoInput): CriarProdutoResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const nome = validarNomeProduto(input.nome); if (!nome.ok) return nome;
    const tipo = validarTipoProduto(input.tipo); if (!tipo.ok) return tipo;
    const unidade = validarUnidade(input.unidade); if (!unidade.ok) return unidade;
    const sku = validarTextoOpcional(input.sku); if (!sku.ok) return sku;
    const descricao = validarTextoOpcional(input.descricao); if (!descricao.ok) return descricao;
    const precoVenda = validarValorNaoNegativo(input.precoVenda ?? 0, "precoVenda"); if (!precoVenda.ok) return precoVenda;
    const custoReferencia = validarValorOpcionalNaoNegativo(input.custoReferencia, "custoReferencia"); if (!custoReferencia.ok) return custoReferencia;
    return executarEmTransacao(deps.transacao, async () => {
      const agora = deps.relogio.agora();
      const produtoId = deps.idPorta.gerarId();
      const res = await deps.produtosRepositorio.criar({ produtoId, locatarioId: locatarioId.value, sku: sku.value, nome: nome.value, descricao: descricao.value, unidade: unidade.value, tipo: tipo.value, status: "ATIVO", precoVenda: precoVenda.value, custoReferencia: custoReferencia.value, criadoEm: agora, atualizadoEm: agora, excluidoEm: null, excluidoPor: null, excluidoMotivo: null });
      if (!res.ok) return res;
      return wrapOk<CriarProdutoOutput>({ produtoId: res.value.produtoId });
    });
  };
}
