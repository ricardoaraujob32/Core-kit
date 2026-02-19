import { describe, it, expect } from "vitest";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { isOk, isErr } from "../../src/result";

import { criarRepositorioEstoqueEmMemoria } from "../../src/estoque/repositorioMemoria";
import { criarItemCatalogo } from "../../src/estoque/usecases/criarItemCatalogo";
import { registrarMovimentoEstoque } from "../../src/estoque/usecases/registrarMovimentoEstoque";

import { criarRepositorioTransacoesEmMemoria } from "../../src/transacoes/repositorioMemoria";
import { criarTransacaoConfirmada } from "../../src/transacoes/usecases/criarTransacaoConfirmada";

describe("Transações - criarTransacaoConfirmada (MVP)", () => {
  it("deve exigir permissão", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();
    const transacoesRepo = criarRepositorioTransacoesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: [],
    });

    const r = await criarTransacaoConfirmada(ctx, { estoqueRepo, transacoesRepo }, { tipo: "COMPRA", itens: [] });
    expect(isErr(r)).toBe(true);
  });

  it("deve validar itens não vazios", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();
    const transacoesRepo = criarRepositorioTransacoesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["TRANSACOES_CRIAR"],
    });

    const r = await criarTransacaoConfirmada(ctx, { estoqueRepo, transacoesRepo }, { tipo: "COMPRA", itens: [] });
    expect(isErr(r)).toBe(true);
  });

  it("COMPRA deve gerar entrada no estoque para PRODUTO", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();
    const transacoesRepo = criarRepositorioTransacoesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_CRIAR_ITEM", "ESTOQUE_MOVIMENTAR", "TRANSACOES_CRIAR"],
    });

    const itemProduto = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "PRODUTO", nome: "Parafuso 10mm" });
    expect(isOk(itemProduto)).toBe(true);
    if (!isOk(itemProduto)) return;

    const t = await criarTransacaoConfirmada(ctx, { estoqueRepo, transacoesRepo }, {
      tipo: "COMPRA",
      itens: [{ itemId: itemProduto.value.id, quantidade: 10 }],
      observacao: "Compra inicial",
    });
    expect(isOk(t)).toBe(true);
  });

  it("VENDA deve falhar se não houver saldo suficiente", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();
    const transacoesRepo = criarRepositorioTransacoesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_CRIAR_ITEM", "ESTOQUE_MOVIMENTAR", "TRANSACOES_CRIAR"],
    });

    const itemProduto = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "PRODUTO", nome: "Parafuso 10mm" });
    expect(isOk(itemProduto)).toBe(true);
    if (!isOk(itemProduto)) return;

    const t = await criarTransacaoConfirmada(ctx, { estoqueRepo, transacoesRepo }, {
      tipo: "VENDA",
      itens: [{ itemId: itemProduto.value.id, quantidade: 1 }],
    });

    expect(isErr(t)).toBe(true);
  });

  it("VENDA deve gerar saída após entrada prévia", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();
    const transacoesRepo = criarRepositorioTransacoesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_CRIAR_ITEM", "ESTOQUE_MOVIMENTAR", "TRANSACOES_CRIAR"],
    });

    const itemProduto = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "PRODUTO", nome: "Parafuso 10mm" });
    expect(isOk(itemProduto)).toBe(true);
    if (!isOk(itemProduto)) return;

    // entrada manual (simula estoque já existente)
    const entrada = await registrarMovimentoEstoque(ctx, { estoqueRepo }, {
      itemId: itemProduto.value.id,
      tipo: "ENTRADA",
      quantidade: 10,
      motivo: "Entrada inicial",
    });
    expect(isOk(entrada)).toBe(true);

    const venda = await criarTransacaoConfirmada(ctx, { estoqueRepo, transacoesRepo }, {
      tipo: "VENDA",
      itens: [{ itemId: itemProduto.value.id, quantidade: 3 }],
      observacao: "Venda balcão",
    });

    expect(isOk(venda)).toBe(true);
  });

  it("SERVICO pode existir na transação, mas não gera movimento", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();
    const transacoesRepo = criarRepositorioTransacoesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_CRIAR_ITEM", "ESTOQUE_MOVIMENTAR", "TRANSACOES_CRIAR"],
    });

    const servico = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "SERVICO", nome: "Instalação" });
    expect(isOk(servico)).toBe(true);
    if (!isOk(servico)) return;

    const venda = await criarTransacaoConfirmada(ctx, { estoqueRepo, transacoesRepo }, {
      tipo: "VENDA",
      itens: [{ itemId: servico.value.id, quantidade: 1 }],
    });

    expect(isOk(venda)).toBe(true);
  });
});
