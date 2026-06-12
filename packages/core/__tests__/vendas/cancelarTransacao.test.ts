// packages/core/__tests__/vendas/cancelarTransacao.test.ts

import { describe, expect, it } from "vitest";
import { createFnCancelarTransacao } from "../../src/vendas/usecases/cancelarTransacao";
import { criarIdPortaSequencial, DATA_TESTE, relogioTeste } from "./helpers/vendasUsecaseTestUtils";
import { criarTransacaoTeste, criarVendasSimulacroRepositorio } from "./simulacros/vendasSimulacroRepositorio";

describe("#1 - createFnCancelarTransacao", () => {
  it("#1.1 - deve cancelar transação e registrar histórico", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "ABERTA" })] });
    const usecase = createFnCancelarTransacao({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", usuarioId: "usr-1", motivo: " motivo " });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.transacao.status).toBe("CANCELADA");
      expect(resultado.value.transacao.canceladoEm).toEqual(DATA_TESTE);
      expect(resultado.value.transacao.canceladoPor).toBe("usr-1");
      expect(resultado.value.transacao.canceladoMotivo).toBe("motivo");
    }
    expect(repo.dump().historico).toHaveLength(1);
  });

  it("#1.2 - deve falhar quando transação não existe", async () => {
    const usecase = createFnCancelarTransacao({ vendasRepositorio: criarVendasSimulacroRepositorio(), idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-x" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando motivo é inválido", async () => {
    const usecase = createFnCancelarTransacao({ vendasRepositorio: criarVendasSimulacroRepositorio(), idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1", motivo: "x".repeat(10000) });
    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando transição é inválida", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "CONCLUIDA" })] });
    const usecase = createFnCancelarTransacao({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha ao criar histórico", async () => {
    const repo = criarVendasSimulacroRepositorio({ transacoes: [criarTransacaoTeste({ status: "ABERTA" })] });
    repo.simularFalha("criarHistorico");
    const usecase = createFnCancelarTransacao({ vendasRepositorio: repo, idPorta: criarIdPortaSequencial(["hist-1"]), relogio: relogioTeste });
    const resultado = await usecase({ locatarioId: "loc-1", transacaoId: "trx-1" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
