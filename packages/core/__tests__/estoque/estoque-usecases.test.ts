import { describe, it, expect } from "vitest";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { isOk, isErr } from "../../src/result";

import { criarRepositorioEstoqueEmMemoria } from "../../src/estoque/repositorioMemoria";
import { criarItemCatalogo } from "../../src/estoque/usecases/criarItemCatalogo";
import { listarItensCatalogo } from "../../src/estoque/usecases/listarItensCatalogo";
import { registrarMovimentoEstoque } from "../../src/estoque/usecases/registrarMovimentoEstoque";

describe("Estoque - casos de uso (MVP)", () => {
  it("criarItemCatalogo deve exigir permissão", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: [],
    });

    const r = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "PRODUTO", nome: "Parafuso 10mm" });
    expect(isErr(r)).toBe(true);
  });

  it("criarItemCatalogo deve criar e impedir duplicidade por nome no locatário", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_CRIAR_ITEM"],
    });

    const a = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "PRODUTO", nome: "  Parafuso   10mm " });
    expect(isOk(a)).toBe(true);

    const b = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "PRODUTO", nome: "Parafuso 10mm" });
    expect(isErr(b)).toBe(true);
  });

  it("listarItensCatalogo deve exigir permissão", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: [],
    });

    const r = await listarItensCatalogo(ctx, { estoqueRepo });
    expect(isErr(r)).toBe(true);
  });

  it("registrarMovimentoEstoque deve criar estoque padrão automaticamente quando não informado", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_CRIAR_ITEM", "ESTOQUE_MOVIMENTAR"],
    });

    const item = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "PRODUTO", nome: "Parafuso 10mm" });
    expect(isOk(item)).toBe(true);
    if (!isOk(item)) return;

    const mov = await registrarMovimentoEstoque(ctx, { estoqueRepo }, {
      itemId: item.value.id,
      tipo: "ENTRADA",
      quantidade: 10,
      motivo: "Entrada inicial",
      // estoqueId: undefined (padrão)
    });

    expect(isOk(mov)).toBe(true);
  });

  it("registrarMovimentoEstoque deve impedir saída maior que saldo", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_CRIAR_ITEM", "ESTOQUE_MOVIMENTAR"],
    });

    const item = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "PRODUTO", nome: "Parafuso 10mm" });
    expect(isOk(item)).toBe(true);
    if (!isOk(item)) return;

    const saida = await registrarMovimentoEstoque(ctx, { estoqueRepo }, {
      itemId: item.value.id,
      tipo: "SAIDA",
      quantidade: 1,
      motivo: "Venda",
    });

    expect(isErr(saida)).toBe(true);
  });

  it("registrarMovimentoEstoque deve rejeitar movimento para SERVICO", async () => {
    const estoqueRepo = criarRepositorioEstoqueEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["ESTOQUE_CRIAR_ITEM", "ESTOQUE_MOVIMENTAR"],
    });

    const servico = await criarItemCatalogo(ctx, { estoqueRepo }, { tipo: "SERVICO", nome: "Instalação" });
    expect(isOk(servico)).toBe(true);
    if (!isOk(servico)) return;

    const mov = await registrarMovimentoEstoque(ctx, { estoqueRepo }, {
      itemId: servico.value.id,
      tipo: "ENTRADA",
      quantidade: 1,
      motivo: "não deveria",
    });

    expect(isErr(mov)).toBe(true);
  });
});
