import { describe, it, expect } from "vitest";

// Ajuste conforme seu módulo real
import { wrapOk, wrapErr } from "../src/index";

describe("Planos - regras mínimas", () => {
  it("plano deve habilitar módulos essenciais sempre (locatário, autenticação, backup)", () => {
    const plano = {
      codigo: "BASICO",
      modulos: ["LOCATARIOS", "AUTENTICACAO", "BACKUP"],
    };

    expect(plano.modulos).toEqual(expect.arrayContaining(["LOCATARIOS", "AUTENTICACAO", "BACKUP"]));
  });

  it("módulo pago/extra deve estar ausente no básico (ex.: importação como serviço)", () => {
    const planoBasico = { modulos: ["LOCATARIOS", "AUTENTICACAO", "BACKUP", "RELATORIOS_SIMPLES"] };
    expect(planoBasico.modulos.includes("IMPORTACAO")).toBe(false);
  });
});
