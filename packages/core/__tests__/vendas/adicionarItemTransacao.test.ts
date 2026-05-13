// packages/core/__tests__/vendas/adicionarItemTransacao.test.ts

import { describe, expect, it } from "vitest";
import { createFnAdicionarItemTransacao } from "../../src/vendas/usecases/adicionarItemTransacao";
import { criarItemTransacaoTeste, criarTransacaoTeste, criarVendasSimulacroRepositorio } from "./simulacros/vendasSimulacroRepositorio";
import { criarEstoquePadraoConsultaFake, criarProdutosConsultaFake } from "./fakes/vendasPortasFake";
import { criarIdPortaSequencial, DATA_TESTE, relogioTeste } from "./helpers/vendasUsecaseTestUtils";

describe("#1 - createFnAdicionarItemTransacao", () => {
  it("#1.1 - deve adicionar item, atualizar totais e registrar histórico", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1", valorAcrescimo: 2 })] });
    const usecase = createFnAdicionarItemTransacao({
      vendasRepositorio: repo,
      produtosConsulta: criarProdutosConsultaFake(),
      estoquePadraoConsulta: criarEstoquePadraoConsultaFake(),
      idPorta: criarIdPortaSequencial(["item-1", "hist-1"]),
      relogio: relogioTeste,
    });

    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", produtoId: "prod-1", quantidade: 2, valorDesconto: 1, usuarioId: "usr-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.item.itemTransacaoId).toBe("item-1");
      expect(resultado.value.transacao.valorSubtotal).toBe(20);
      expect(resultado.value.transacao.valorDesconto).toBe(1);
      expect(resultado.value.transacao.valorAcrescimo).toBe(2);
      expect(resultado.value.transacao.valorTotal).toBe(21);
      expect(resultado.value.item.criadoEm).toEqual(DATA_TESTE);
    }
    expect(repo.dump().historico).toHaveLength(1);
  });

  it("#1.2 - deve falhar quando transação não existe", async () => {
    const usecase = createFnAdicionarItemTransacao({
      vendasRepositorio: criarVendasSimulacroRepositorio(),
      produtosConsulta: criarProdutosConsultaFake(),
      estoquePadraoConsulta: criarEstoquePadraoConsultaFake(),
      idPorta: criarIdPortaSequencial(["item-1"]),
      relogio: relogioTeste,
    });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-x", produtoId: "prod-1", quantidade: 1 });
    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando transação não permite edição", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1", status: "CONCLUIDA" })] });
    const usecase = createFnAdicionarItemTransacao({
      vendasRepositorio: repo,
      produtosConsulta: criarProdutosConsultaFake(),
      estoquePadraoConsulta: criarEstoquePadraoConsultaFake(),
      idPorta: criarIdPortaSequencial(["item-1"]),
      relogio: relogioTeste,
    });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", produtoId: "prod-1", quantidade: 1 });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando produto está inativo", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1" })] });
    const usecase = createFnAdicionarItemTransacao({
      vendasRepositorio: repo,
      produtosConsulta: criarProdutosConsultaFake({ produto: { produtoId: "prod-1", nome: "Produto", tipo: "PRODUTO", status: "INATIVO", precoVenda: 10 } }),
      estoquePadraoConsulta: criarEstoquePadraoConsultaFake(),
      idPorta: criarIdPortaSequencial(["item-1"]),
      relogio: relogioTeste,
    });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", produtoId: "prod-1", quantidade: 1 });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve falhar quando produto movimenta estoque e não existe estoque padrão", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1" })] });
    const usecase = createFnAdicionarItemTransacao({
      vendasRepositorio: repo,
      produtosConsulta: criarProdutosConsultaFake(),
      estoquePadraoConsulta: criarEstoquePadraoConsultaFake({ estoqueId: null }),
      idPorta: criarIdPortaSequencial(["item-1"]),
      relogio: relogioTeste,
    });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", produtoId: "prod-1", quantidade: 1 });
    expect(resultado.ok).toBe(false);
  });

  it("#1.6 - não deve exigir estoque padrão para serviço", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1" })] });
    const usecase = createFnAdicionarItemTransacao({
      vendasRepositorio: repo,
      produtosConsulta: criarProdutosConsultaFake({ produto: { produtoId: "serv-1", nome: "Serviço", tipo: "SERVICO", status: "ATIVO", precoVenda: 50 } }),
      estoquePadraoConsulta: criarEstoquePadraoConsultaFake({ estoqueId: null }),
      idPorta: criarIdPortaSequencial(["item-1", "hist-1"]),
      relogio: relogioTeste,
    });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", produtoId: "serv-1", quantidade: 1 });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.item.movimentaEstoque).toBe(false);
      expect(resultado.value.item.estoqueId).toBeNull();
    }
  });
});
