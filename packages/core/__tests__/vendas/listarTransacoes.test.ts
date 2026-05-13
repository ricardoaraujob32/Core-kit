// packages/core/__tests__/vendas/listarTransacoes.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarTransacoes } from "../../src/vendas/usecases/listarTransacoes";
import { criarTransacaoTeste, criarVendasSimulacroRepositorio } from "./simulacros/vendasSimulacroRepositorio";

describe("#1 - createFnListarTransacoes", () => {
  it("#1.1 - deve listar transações do locatário", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [
      criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1" }),
      criarTransacaoTeste({ transacaoId: "trx-2", locatarioId: "loc-1" }),
      criarTransacaoTeste({ transacaoId: "trx-3", locatarioId: "loc-2" }),
    ]});
    const usecase = createFnListarTransacoes({ vendasRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1" });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens.map((t) => t.transacaoId)).toEqual(["trx-1", "trx-2"]);
  });

  it("#1.2 - deve filtrar por tipo e status", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [
      criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1", tipo: "VENDA", status: "RASCUNHO" }),
      criarTransacaoTeste({ transacaoId: "trx-2", locatarioId: "loc-1", tipo: "COMPRA", status: "RASCUNHO" }),
    ]});
    const usecase = createFnListarTransacoes({ vendasRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", tipo: "VENDA", status: "RASCUNHO" });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens.map((t) => t.transacaoId)).toEqual(["trx-1"]);
  });

  it("#1.3 - deve respeitar cursor e limite", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [
      criarTransacaoTeste({ transacaoId: "trx-1", locatarioId: "loc-1" }),
      criarTransacaoTeste({ transacaoId: "trx-2", locatarioId: "loc-1" }),
    ]});
    const usecase = createFnListarTransacoes({ vendasRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1", cursor: "trx-1", limite: 1 });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens.map((t) => t.transacaoId)).toEqual(["trx-2"]);
  });

  it("#1.4 - deve falhar quando tipo é inválido", async () => {
    const usecase = createFnListarTransacoes({ vendasRepositorio: criarVendasSimulacroRepositorio() });
    const resultado = await usecase({ locatarioId: "loc-1", tipo: "INVALIDO" as never });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório", async () => {
    const repo = criarVendasSimulacroRepositorio();
    repo.simularFalha("listarTransacoes");
    const usecase = createFnListarTransacoes({ vendasRepositorio: repo });
    const resultado = await usecase({ locatarioId: "loc-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
