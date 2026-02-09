// packages/core/src/assinaturas/__tests__/regras.test.ts
// Finalidade: garantir o comportamento das regras de pagamento (status => permite uso).

import { describe, expect, it } from "vitest";
import { assinaturaPermiteUso, assinaturaEstaInadimplente } from "../regras";
import type { Assinatura } from "../tipos";

function criarAssinaturaParcial(parcial: Partial<Assinatura>): Assinatura {
  const agora = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: "a1",
    locatarioId: "l1",
    planoId: "p1",
    status: "EM_TESTE",
    inicioEm: agora,
    fimEm: null,
    moeda: "BRL",
    valorCentavos: 0,
    ciclo: "MENSAL",
    proximoVencimentoEm: null,
    ultimoPagamentoEm: null,
    provedorPagamento: null,
    refExterna: null,
    falhaPagamentoEm: null,
    motivo: null,
    criadoEm: agora,
    atualizadoEm: agora,
    excluidoEm: null,
    ...parcial,
  };
}

describe("assinaturas/regras", () => {
  it("assinaturaPermiteUso: ATIVA => true", () => {
    const a = criarAssinaturaParcial({ status: "ATIVA" });
    expect(assinaturaPermiteUso(a)).toBe(true);
  });

  it("assinaturaPermiteUso: EM_TESTE => true", () => {
    const a = criarAssinaturaParcial({ status: "EM_TESTE" });
    expect(assinaturaPermiteUso(a)).toBe(true);
  });

  it("assinaturaPermiteUso: INADIMPLENTE => false", () => {
    const a = criarAssinaturaParcial({ status: "INADIMPLENTE" });
    expect(assinaturaPermiteUso(a)).toBe(false);
  });

  it("assinaturaPermiteUso: SUSPENSA/CANCELADA/EXPIRADA => false", () => {
    expect(assinaturaPermiteUso(criarAssinaturaParcial({ status: "SUSPENSA" }))).toBe(false);
    expect(assinaturaPermiteUso(criarAssinaturaParcial({ status: "CANCELADA" }))).toBe(false);
    expect(assinaturaPermiteUso(criarAssinaturaParcial({ status: "EXPIRADA" }))).toBe(false);
  });

  it("assinaturaEstaInadimplente: sem proximoVencimentoEm => false", () => {
    const a = criarAssinaturaParcial({ proximoVencimentoEm: null });
    expect(assinaturaEstaInadimplente(a, new Date("2026-02-01T00:00:00.000Z"))).toBe(false);
  });

  it("assinaturaEstaInadimplente: agora > proximoVencimentoEm => true", () => {
    const a = criarAssinaturaParcial({ proximoVencimentoEm: new Date("2026-01-10T00:00:00.000Z") });
    expect(assinaturaEstaInadimplente(a, new Date("2026-01-11T00:00:00.000Z"))).toBe(true);
  });

  it("assinaturaEstaInadimplente: agora <= proximoVencimentoEm => false", () => {
    const a = criarAssinaturaParcial({ proximoVencimentoEm: new Date("2026-01-10T00:00:00.000Z") });
    expect(assinaturaEstaInadimplente(a, new Date("2026-01-10T00:00:00.000Z"))).toBe(false);
  });
});
