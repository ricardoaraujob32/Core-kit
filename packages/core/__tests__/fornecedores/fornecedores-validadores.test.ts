import { describe, it, expect } from "vitest";
import { nomeFornecedorValido, normalizarNomeFornecedor, emailValidoOpcional } from "../../src/fornecedores/validadores";

describe("Fornecedores - validadores", () => {
  it("normalizarNomeFornecedor deve padronizar espaços", () => {
    expect(normalizarNomeFornecedor("  Oficina   do   Zé ")).toBe("Oficina do Zé");
  });

  it("nomeFornecedorValido deve rejeitar vazio e curto", () => {
    expect(nomeFornecedorValido("")).toBe(false);
    expect(nomeFornecedorValido("  ")).toBe(false);
    expect(nomeFornecedorValido("AB")).toBe(false);
  });

  it("nomeFornecedorValido deve aceitar nomes plausíveis", () => {
    expect(nomeFornecedorValido("Oficina do Zé")).toBe(true);
    expect(nomeFornecedorValido("Distribuidora Central")).toBe(true);
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
