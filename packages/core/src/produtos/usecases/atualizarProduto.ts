// packages/core/src/produtos/usecases/atualizarProduto.ts

import type { ProdutosRepositorio } from "../portasRepositorio.js";
import type { AtualizarProdutoInput, AtualizarProdutoOutput, AtualizarProdutoResult } from "../tipos.js";
import { validarLocatarioId, validarProdutoId, validarNomeProduto, validarSkuProduto, validarDescricaoProduto, validarUnidadeProduto, validarTipoProduto, validarPrecoVendaProduto,
  validarCustoReferenciaProduto, 
  validarValorOpcionalNaoNegativo} from "../validadores.js";
import { produtoNaoEncontrado } from "../erros.js";
import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel/index.js";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAtualizarProduto(deps: {
  produtosRepositorio: ProdutosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   */
  return async function atualizarProduto(input: AtualizarProdutoInput): AtualizarProdutoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const produtoId = validarProdutoId(input.produtoId);
    if (!produtoId.ok) return produtoId;

    const sku = validarSkuProduto(input.sku);
    if (!sku.ok) return sku;

    const nome = input.nome !== undefined ? validarNomeProduto(input.nome) : null;
    if (nome && !nome.ok) return nome;

    const descricao = input.descricao !== undefined ? validarDescricaoProduto(input.descricao) : null;
    if (descricao && !descricao.ok) return descricao;

    const unidade = input.unidade !== undefined ? validarUnidadeProduto(input.unidade) : null;
    if (unidade && !unidade.ok) return unidade;

    const tipo = input.tipo !== undefined ? validarTipoProduto(input.tipo) : null;
    if (tipo && !tipo.ok) return tipo;

    const precoVarejoInformado = input.precoVarejo ?? input.precoVenda;
    const precoVarejo = precoVarejoInformado !== undefined ? validarPrecoVendaProduto(precoVarejoInformado) : null;
    if (precoVarejo && !precoVarejo.ok) return precoVarejo;

    const precoAtacado = input.precoAtacado !== undefined ? validarValorOpcionalNaoNegativo(input.precoAtacado, "precoAtacado") : null;
    if (precoAtacado && !precoAtacado.ok) return precoAtacado;

    const quantidadeMinimaAtacado = input.quantidadeMinimaAtacado !== undefined ? validarValorOpcionalNaoNegativo(input.quantidadeMinimaAtacado, "quantidadeMinimaAtacado") : null;
    if (quantidadeMinimaAtacado && !quantidadeMinimaAtacado.ok) {
      return quantidadeMinimaAtacado;
    }

    const custoReferencia = input.custoReferencia !== undefined ? validarCustoReferenciaProduto(input.custoReferencia) : null;
    if (custoReferencia && !custoReferencia.ok) return custoReferencia;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.produtosRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
        produtoId: produtoId.value,
      });
      if (!atual.ok) return atual;
      if (!atual.value) return produtoNaoEncontrado(produtoId.value);

      const agora = deps.relogio.agora();
      const precoVarejoFinal = precoVarejo?.value ?? atual.value.precoVarejo ?? atual.value.precoVenda;

      const atualizado = await deps.produtosRepositorio.atualizar({
        ...atual.value,
        sku: sku.value,
        nome: nome?.value ?? atual.value.nome,
        descricao: descricao?.value ?? atual.value.descricao,
        unidade: unidade?.value ?? atual.value.unidade,
        tipo: tipo?.value ?? atual.value.tipo,
        precoVenda: precoVarejoFinal,
        precoVarejo: precoVarejoFinal,
        precoAtacado: precoAtacado ? precoAtacado.value : atual.value.precoAtacado,
        quantidadeMinimaAtacado: quantidadeMinimaAtacado ? quantidadeMinimaAtacado.value : atual.value.quantidadeMinimaAtacado,
        custoReferencia: custoReferencia?.value ?? atual.value.custoReferencia,
        atualizadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<AtualizarProdutoOutput>({
        produto: atualizado.value,
      });
    });
  };
}