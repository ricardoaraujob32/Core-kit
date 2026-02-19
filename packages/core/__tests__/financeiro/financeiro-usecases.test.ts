import { describe, it, expect } from "vitest";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { isOk, isErr } from "../../src/result";

import { criarRepositorioFinanceiroEmMemoria } from "../../src/financeiro/repositorioMemoria";
import { criarLancamento } from "../../src/financeiro/usecases/criarLancamento";
import { listarLancamentos } from "../../src/financeiro/usecases/listarLancamentos";
import { quitarLancamento } from "../../src/financeiro/usecases/quitarLancamento";
import { criarLancamentoVinculado } from "../../src/financeiro/usecases/criarLancamentoVinculado";

describe("Financeiro leve - MVP", () => {
  it("criarLancamento deve exigir permissão", async () => {
    const repo = criarRepositorioFinanceiroEmMemoria();
    const ctx = createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: [] });

    const r = await criarLancamento(ctx, { financeiroRepo: repo }, {
      tipo: "RECEITA",
      valorCentavos: 1000,
      descricao: "Teste",
    });

    expect(isErr(r)).toBe(true);
  });

  it("criarLancamento deve validar valor e descricao", async () => {
    const repo = criarRepositorioFinanceiroEmMemoria();
    const ctx = createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: ["FINANCEIRO_CRIAR"] });

    const r1 = await criarLancamento(ctx, { financeiroRepo: repo }, { tipo: "RECEITA", valorCentavos: 0, descricao: "Ok" });
    expect(isErr(r1)).toBe(true);

    const r2 = await criarLancamento(ctx, { financeiroRepo: repo }, { tipo: "RECEITA", valorCentavos: 100, descricao: "  " });
    expect(isErr(r2)).toBe(true);
  });

  it("listarLancamentos deve exigir permissão", async () => {
    const repo = criarRepositorioFinanceiroEmMemoria();
    const ctx = createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: [] });

    const r = await listarLancamentos(ctx, { financeiroRepo: repo }, {});
    expect(isErr(r)).toBe(true);
  });

  it("criarLancamentoVinculado deve criar RECEITA/DESPESA de forma coerente", async () => {
    const repo = criarRepositorioFinanceiroEmMemoria();
    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["FINANCEIRO_CRIAR"],
    });

    const receita = await criarLancamentoVinculado(ctx, { financeiroRepo: repo }, {
      origem: { tipo: "TRANSACAO", id: "trx_1", natureza: "VENDA" },
      valorCentavos: 12345,
      descricao: "Venda balcão",
    });
    expect(isOk(receita)).toBe(true);

    const despesa = await criarLancamentoVinculado(ctx, { financeiroRepo: repo }, {
      origem: { tipo: "TRANSACAO", id: "trx_2", natureza: "COMPRA" },
      valorCentavos: 999,
      descricao: "Compra fornecedor",
    });
    expect(isOk(despesa)).toBe(true);
  });

  it("quitarLancamento deve exigir permissão e mudar status para QUITADO", async () => {
    const repo = criarRepositorioFinanceiroEmMemoria();
    const ctxCriar = createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: ["FINANCEIRO_CRIAR"] });

    const criado = await criarLancamento(ctxCriar, { financeiroRepo: repo }, {
      tipo: "RECEITA",
      valorCentavos: 5000,
      descricao: "Receber",
    });
    expect(isOk(criado)).toBe(true);
    if (!isOk(criado)) return;

    const negado = await quitarLancamento(
      createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: [] }),
      { financeiroRepo: repo },
      { lancamentoId: criado.value.id },
    );
    expect(isErr(negado)).toBe(true);

    const ok = await quitarLancamento(
      createContextoExecucao({ locatarioId: "L1", usuarioId: "U1", permissoes: ["FINANCEIRO_QUITAR"] }),
      { financeiroRepo: repo },
      { lancamentoId: criado.value.id },
    );
    expect(isOk(ok)).toBe(true);
  });
});
