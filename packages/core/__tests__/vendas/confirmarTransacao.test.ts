// packages/core/__tests__/vendas/confirmarTransacao.test.ts

import { describe, expect, it } from "vitest";
import { createFnConfirmarTransacao } from "../../src/vendas/usecases/confirmarTransacao";
import { criarIdPortaSequencial, DATA_TESTE, relogioTeste } from "./helpers/vendasUsecaseTestUtils";
import { criarItemTransacaoTeste, criarTransacaoTeste, criarVendasSimulacroRepositorio } from "./simulacros/vendasSimulacroRepositorio";

describe("#1 - createFnConfirmarTransacao", () => {
  it("#1.1 - deve confirmar transação com itens", async () => {
    const repo = criarVendasSimulacroRepositorio({
      transacoes: [criarTransacaoTeste({ status: "RASCUNHO" })],
      itens: [criarItemTransacaoTeste()],
    });
    const usecase = createFnConfirmarTransacao({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });

    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", usuarioId: "usr-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.transacao.status).toBe("CONFIRMADA");
      expect(resultado.value.transacao.atualizadoEm).toEqual(DATA_TESTE);
    }
    expect(repo.dump().historico).toHaveLength(1);
  });

  it("#1.2 - deve falhar quando transação não existe", async () => {
    const usecase = createFnConfirmarTransacao({ vendasRepositorio: criarVendasSimulacroRepositorio(), idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-x" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando transação não possui itens", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "RASCUNHO" })] });
    const usecase = createFnConfirmarTransacao({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando transição de estado é inválida", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "CONCLUIDA" })], itens: [criarItemTransacaoTeste()] });
    const usecase = createFnConfirmarTransacao({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha ao criar histórico", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "RASCUNHO" })], itens: [criarItemTransacaoTeste()] });
    repo.simularFalha("criarHistorico");
    const usecase = createFnConfirmarTransacao({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
