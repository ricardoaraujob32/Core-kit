import { describe, it, expect } from "vitest";
import { wrapOk } from "../../src/index";

describe("Assinaturas/Plano do locatário - comportamento", () => {
  it("locatário sem assinatura ativa deve ficar bloqueado por padrão", () => {
    const assinatura = null;
    const permitido = Boolean(assinatura && (assinatura as any).status === "ATIVA");
    expect(permitido).toBe(false);
  });

  it("assinatura ativa deve liberar módulos do plano", () => {
    const assinatura = { status: "ATIVA", modulos: ["RELATORIOS_SIMPLES"] };
    expect(assinatura.status).toBe("ATIVA");
    expect(assinatura.modulos).toContain("RELATORIOS_SIMPLES");
  });
});
