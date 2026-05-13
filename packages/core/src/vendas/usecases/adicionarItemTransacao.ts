// packages/core/src/vendas/usecases/adicionarItemTransacao.ts

import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import { produtoInativo } from "../../produtos";
import type { EstoquePadraoConsultaPorta, ProdutoComercialConsultaPorta, VendasRepositorio } from "../portasRepositorio";
import type { AdicionarItemTransacaoInput, AdicionarItemTransacaoOutput, AdicionarItemTransacaoResult } from "../tipos";
import { estoquePadraoNaoEncontrado, transacaoNaoEditavel, transacaoNaoEncontrada } from "../erros";
import { validarLocatarioId, validarQuantidade, validarTransacaoId, validarValorNaoNegativo } from "../validadores";
import { calcularTotais, criarHistoricoTransacao } from "./helpers";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAdicionarItemTransacao(deps: { 
  vendasRepositorio: VendasRepositorio; 
  produtosConsulta: ProdutoComercialConsultaPorta; 
  estoquePadraoConsulta: EstoquePadraoConsultaPorta; 
  idPorta: IdPorta; 
  relogio: RelogioPorta; 
  transacao?: TransacaoPorta 
}) {
  /**
   * 
   */
  return async function adicionarItemTransacao(input: AdicionarItemTransacaoInput): AdicionarItemTransacaoResult {
    const locatarioId = validarLocatarioId(input.locatarioId); 
    if (!locatarioId.ok) return locatarioId;

    const transacaoId = validarTransacaoId(input.transacaoId); 
    if (!transacaoId.ok) return transacaoId;

    const quantidade = validarQuantidade(input.quantidade); 
    if (!quantidade.ok) return quantidade;

    const valorDesconto = validarValorNaoNegativo(input.valorDesconto ?? 0, "valorDesconto"); 
    if (!valorDesconto.ok) return valorDesconto;

    return executarEmTransacao(deps.transacao, async () => {
      const transacao = await deps.vendasRepositorio.buscarTransacaoPorId({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); 
      if (!transacao.ok) return transacao;

      if (!transacao.value) return transacaoNaoEncontrada(transacaoId.value);

      if (transacao.value.status !== "RASCUNHO" && transacao.value.status !== "ABERTA") return transacaoNaoEditavel(transacaoId.value);

      const produto = await deps.produtosConsulta.buscarProdutoParaTransacao({ 
        locatarioId: locatarioId.value,
         produtoId: input.produtoId 
      }); 
      if (!produto.ok) return produto;

      if (produto.value.status !== "ATIVO") return produtoInativo(produto.value.produtoId);

      const movimentaEstoque = produto.value.tipo === "PRODUTO";
      let estoqueId = input.estoqueId ?? null;

      if (movimentaEstoque && !estoqueId) {
        const estoque = await deps.estoquePadraoConsulta.obterEstoquePadrao({ 
          locatarioId: locatarioId.value 
        });
        if (!estoque.ok) return estoque;
        if (!estoque.value) return estoquePadraoNaoEncontrado();
        estoqueId = estoque.value.estoqueId;
      }

      const valorUnitario = validarValorNaoNegativo(input.valorUnitario ?? produto.value.precoVenda, "valorUnitario"); 
      if (!valorUnitario.ok) return valorUnitario;

      const agora = deps.relogio.agora();
      
      const valorSubtotalItem = quantidade.value * valorUnitario.value;

      const valorAcrescimo = validarValorNaoNegativo(
        input.valorAcrescimo ?? 0,
        "valorAcrescimo",
      );
      if (!valorAcrescimo.ok) return valorAcrescimo;

      const item = {
        itemTransacaoId: deps.idPorta.gerarId(),
        transacaoId: transacaoId.value,
        locatarioId: locatarioId.value,
        produtoId: produto.value.produtoId,
        estoqueId,
        descricao: produto.value.nome,
        tipoProduto: produto.value.tipo,
        quantidade: quantidade.value,
        valorUnitario: valorUnitario.value,
        valorDesconto: valorDesconto.value,
        valorAcrescimo: valorAcrescimo.value,
        valorSubtotal: valorSubtotalItem,
        valorTotal: valorSubtotalItem - valorDesconto.value + valorAcrescimo.value,
        movimentaEstoque,
        criadoEm: agora,
        atualizadoEm: agora,
        excluidoEm: null,
        excluidoPor: null,
        excluidoMotivo: null,
      };
      const criado = await deps.vendasRepositorio.criarItem(item); 
      if (!criado.ok) return criado;

      const itens = await deps.vendasRepositorio.listarItens({ locatarioId: locatarioId.value, transacaoId: transacaoId.value }); 
      if (!itens.ok) return itens;

      const atualizada = calcularTotais(itens.value, { ...transacao.value, atualizadoEm: agora });

      const resAtualizar = await deps.vendasRepositorio.atualizarTransacao(atualizada); 
      if (!resAtualizar.ok) return resAtualizar;

      const hist = await deps.vendasRepositorio.criarHistorico(criarHistoricoTransacao({ 
        idPorta: deps.idPorta, 
        relogio: deps.relogio, 
        transacao: atualizada, 
        evento: "ITEM_ADICIONADO", 
        resumo: "Item adicionado à transação.", 
        usuarioId: input.usuarioId, 
        detalhes: { 
          itemTransacaoId: item.itemTransacaoId, 
          produtoId: item.produtoId, 
          quantidade: item.quantidade 
        } 
      })); 
      if (!hist.ok) return hist;
      
      return wrapOk<AdicionarItemTransacaoOutput>({ 
        item, 
        transacao: resAtualizar.value 
      });
    });
  };
}
