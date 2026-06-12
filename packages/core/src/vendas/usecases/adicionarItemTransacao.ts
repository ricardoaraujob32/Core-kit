// packages/core/src/vendas/usecases/adicionarItemTransacao.ts

import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import { produtoInativo } from "../../produtos";
import type { EstoquePadraoConsultaPorta, ProdutoComercialConsultaPorta, VendasRepositorio } from "../portasRepositorio";
import type { AdicionarItemTransacaoInput, AdicionarItemTransacaoOutput, AdicionarItemTransacaoResult } from "../tipos";
import { estoquePadraoNaoEncontrado, transacaoNaoEditavel, transacaoNaoEncontrada } from "../erros";
import { validarLocatarioId, validarQuantidade, validarTransacaoId, validarValorNaoNegativo } from "../validadores";
import { calcularTotais, criarHistoricoTransacao } from "./helpers";

function resolverValorUnitario(params: {
  valorUnitarioInformado?: number;
  quantidade: number;
  precoVarejo: number;
  precoAtacado: number | null;
  quantidadeMinimaAtacado: number | null;
}): number {
  if (params.valorUnitarioInformado !== undefined && params.valorUnitarioInformado > 0) {
    return params.valorUnitarioInformado;
  }

  const precoAtacado = params.precoAtacado;
  const quantidadeMinimaAtacado = params.quantidadeMinimaAtacado;

  if (precoAtacado !== null && quantidadeMinimaAtacado !== null && params.quantidade >= quantidadeMinimaAtacado) {
    return precoAtacado;
  }

  return params.precoVarejo;
}

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

    const valorAcrescimo = validarValorNaoNegativo(input.valorAcrescimo ?? 0, "valorAcrescimo");
    if (!valorAcrescimo.ok) return valorAcrescimo;

    return executarEmTransacao(deps.transacao, async () => {
      const transacaoAtual = await deps.vendasRepositorio.buscarTransacaoPorId({
        locatarioId: locatarioId.value,
        transacaoId: transacaoId.value,
      });
      if (!transacaoAtual.ok) return transacaoAtual;
      if (!transacaoAtual.value) return transacaoNaoEncontrada(transacaoId.value);

      if (transacaoAtual.value.status !== "RASCUNHO" && transacaoAtual.value.status !== "ABERTA") {
        return transacaoNaoEditavel(transacaoId.value);
      }

      const produto = await deps.produtosConsulta.buscarProdutoParaTransacao({
        locatarioId: locatarioId.value,
        produtoId: input.produtoId,
      });
      if (!produto.ok) return produto;

      if (produto.value.status !== "ATIVO") {
        return produtoInativo(input.produtoId);
      }

      const movimentaEstoque = produto.value.tipo === "PRODUTO";
      let estoqueId = input.estoqueId ?? null;

      if (movimentaEstoque && !estoqueId) {
        const estoquePadrao = await deps.estoquePadraoConsulta.obterEstoquePadrao({
          locatarioId: locatarioId.value,
        });

        if (!estoquePadrao.ok) return estoquePadrao;
        if (!estoquePadrao.value) return estoquePadraoNaoEncontrado();

        estoqueId = estoquePadrao.value.estoqueId;
      }

      if (!movimentaEstoque) {
        estoqueId = null;
      }

      const valorUnitarioAplicado = resolverValorUnitario({
        valorUnitarioInformado: input.valorUnitario,
        quantidade: quantidade.value,
        precoVarejo: produto.value.precoVarejo ?? produto.value.precoVenda,
        precoAtacado: produto.value.precoAtacado,
        quantidadeMinimaAtacado: produto.value.quantidadeMinimaAtacado,
      });

      const valorUnitario = validarValorNaoNegativo(valorUnitarioAplicado, "valorUnitario");
      if (!valorUnitario.ok) return valorUnitario;

      const agora = deps.relogio.agora();
      const valorSubtotal = quantidade.value * valorUnitario.value;
      const valorTotal = valorSubtotal - valorDesconto.value + valorAcrescimo.value;
      
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
        valorSubtotal,
        valorDesconto: valorDesconto.value,
        valorAcrescimo: valorAcrescimo.value,
        valorTotal,
        movimentaEstoque,
        criadoEm: agora,
        atualizadoEm: agora,
        excluidoEm: null,
        excluidoPor: null,
        excluidoMotivo: null,
      };

      const criado = await deps.vendasRepositorio.criarItem(item);
      if (!criado.ok) return criado;

      const itensAtualizados = await deps.vendasRepositorio.listarItens({
        locatarioId: locatarioId.value,
        transacaoId: transacaoId.value,
      });
      if (!itensAtualizados.ok) return itensAtualizados;

      const itensParaCalculo =
        itensAtualizados.value.some(
          (i) => i.itemTransacaoId === item.itemTransacaoId,
        )
          ? itensAtualizados.value
          : [...itensAtualizados.value, item];

     const valorSubtotalTotal = itensParaCalculo.reduce((acc, item) => acc + item.valorSubtotal, 0);
     const valorDescontoTotal = itensParaCalculo.reduce((acc, item) => acc + item.valorDesconto, 0);
     const valorAcrescimoTotal = itensParaCalculo.reduce((acc, item) => acc + item.valorAcrescimo, 0);

    const transacaoComTotaisBase = calcularTotais(
      itensParaCalculo,
      transacaoAtual.value,
    );

    const transacaoComTotais = {
      ...transacaoComTotaisBase,
      valorAcrescimo: transacaoAtual.value.valorAcrescimo,
      valorTotal:
        transacaoComTotaisBase.valorSubtotal -
        transacaoComTotaisBase.valorDesconto +
        transacaoAtual.value.valorAcrescimo,
    };

      const transacaoAtualizada = await deps.vendasRepositorio.atualizarTransacao({
        ...transacaoComTotais,
        atualizadoEm: agora,
      });
      if (!transacaoAtualizada.ok) return transacaoAtualizada;
      

      const hist = await deps.vendasRepositorio.criarHistorico(
        criarHistoricoTransacao({
          idPorta: deps.idPorta,
          relogio: deps.relogio,
          transacao: transacaoAtualizada.value,
          evento: "ITEM_ADICIONADO",
          resumo: "Item adicionado à transação.",
          usuarioId: input.usuarioId,
          statusAnterior: transacaoAtual.value.status,
          statusNovo: transacaoAtualizada.value.status,
        }),
      );
      if (!hist.ok) return hist;

      return wrapOk<AdicionarItemTransacaoOutput>({
        item,
        transacao: transacaoComTotais,
      });
    });
  };
}
