import { executarEmTransacao, type TransacaoPorta, wrapOk, createErroApp } from "../../kernel/index.js";
import {
  ordemServicoNaoConcluida,
  ordemServicoNaoEncontrada,
  ordemServicoVendaJaGerada,
} from "../erros.js";
import type { OrdensServicoRepositorio } from "../portasRepositorio.js";
import type {
  GerarVendaDaOrdemServicoInput,
  GerarVendaDaOrdemServicoResult,
} from "../tipos.js";
import {
  validarLocatarioId,
  validarOrdemServicoId,
  validarValorTotal,
} from "../validadores.js";

export function createFnGerarVendaDaOrdemServico(deps: {
  ordensServicoRepositorio: OrdensServicoRepositorio;
  transacao?: TransacaoPorta;
}) {
  return async function gerarVendaDaOrdemServico(
    input: GerarVendaDaOrdemServicoInput,
  ): GerarVendaDaOrdemServicoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const ordemServicoId = validarOrdemServicoId(input.ordemServicoId);
    if (!ordemServicoId.ok) return ordemServicoId;

    const valorTotal = validarValorTotal(input.valorTotal);
    if (!valorTotal.ok) return valorTotal;

    return executarEmTransacao(deps.transacao, async () => {
      const ordemServico = await deps.ordensServicoRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
        ordemServicoId: ordemServicoId.value,
      });

      if (!ordemServico.ok) return ordemServico;
      if (!ordemServico.value) return ordemServicoNaoEncontrada(ordemServicoId.value);
      if (ordemServico.value.status !== "CONCLUIDA") {
        return ordemServicoNaoConcluida(ordemServicoId.value);
      }

      const produtoId = input.produtoId ?? ordemServico.value.servicoId;

      if (!produtoId) {
        return createErroApp({
          codigo: "INVALIDO",
          mensagem: "Informe um serviço para gerar a venda da ordem de serviço.",
          detalhes: {
            operacao: "ordensServico.gerarVenda.servicoObrigatorio",
            ordemServicoId: ordemServicoId.value,
          },
        });
      }

      const existente = await deps.ordensServicoRepositorio.buscarVendaVinculada({
        locatarioId: locatarioId.value,
        ordemServicoId: ordemServicoId.value,
      });

      if (!existente.ok) return existente;
      if (existente.value) return ordemServicoVendaJaGerada(ordemServicoId.value);

      const valorTotal = input.valorTotal;

      const venda = await deps.ordensServicoRepositorio.criarVendaDaOrdemServico({
        locatarioId: locatarioId.value,
        ordemServicoId: ordemServicoId.value,
        clienteId: ordemServico.value.clienteId,
        produtoId: produtoId,

        valorTotal,
        vencimentoEm: input.vencimentoEm,
        observacao:
          input.observacao ??
          `Venda gerada a partir da OS ${ordemServico.value.titulo}`,

        descricaoItem: ordemServico.value.titulo,
        quantidade: 1,
        valorUnitario: valorTotal,
        valorSubtotal: valorTotal,
        valorDesconto: 0,
        valorTotalItem: valorTotal,
        movimentaEstoque: false,
      });

      if (!venda.ok) return venda;

      return wrapOk({
        ordemServico: {
          ...ordemServico.value,
          transacaoId: venda.value.transacaoId,
        },
        transacaoId: venda.value.transacaoId,
      });
    });
  };
}
