import { describe, it, expect } from "vitest";
import { nomeClienteValido, normalizarNomeCliente, emailValidoOpcional } from "../../src/clientes/validadores";

describe("Clientes - validadores", () => {
  it("normalizarNomeCliente deve padronizar espaços", () => {
    expect(normalizarNomeCliente("  Mercado   Central ")).toBe("Mercado Central");
  });

  it("nomeClienteValido deve rejeitar vazio e curto", () => {
    expect(nomeClienteValido("")).toBe(false);
    expect(nomeClienteValido("  ")).toBe(false);
    expect(nomeClienteValido("AB")).toBe(false);
  });

  it("nomeClienteValido deve aceitar nomes plausíveis", () => {
    expect(nomeClienteValido("Loja do João")).toBe(true);
    expect(nomeClienteValido("Mercado Central")).toBe(true);
  });

  it("emailValidoOpcional deve aceitar undefined e email válido", () => {
    expect(emailValidoOpcional(undefined)).toBe(true);
    expect(emailValidoOpcional("contato@exemplo.com")).toBe(true);
  });

  it("emailValidoOpcional deve rejeitar email inválido", () => {
    expect(emailValidoOpcional("contato@@exemplo.com")).toBe(false);
    expect(emailValidoOpcional("abc")).toBe(false);
  });
});
