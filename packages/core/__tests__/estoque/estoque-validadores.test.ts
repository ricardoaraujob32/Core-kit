import { describe, it, expect } from "vitest";
import { nomeItemValido, normalizarNomeItem, quantidadeValida } from "../../src/estoque/validadores";

describe("Estoque - validadores", () => {
  it("normalizarNomeItem deve padronizar espaços", () => {
    expect(normalizarNomeItem("  Parafuso   10mm ")).toBe("Parafuso 10mm");
  });

  it("nomeItemValido deve rejeitar vazio e curto", () => {
    expect(nomeItemValido("")).toBe(false);
    expect(nomeItemValido("  ")).toBe(false);
    expect(nomeItemValido("AB")).toBe(false);
  });

  it("nomeItemValido deve aceitar nomes plausíveis", () => {
    expect(nomeItemValido("Parafuso 10mm")).toBe(true);
    expect(nomeItemValido("Serviço de instalação")).toBe(true);
  });

  it("quantidadeValida deve validar positivos e limitar extremos", () => {
    expect(quantidadeValida(0)).toBe(false);
    expect(quantidadeValida(-1)).toBe(false);
    expect(quantidadeValida(1)).toBe(true);
    expect(quantidadeValida(999999999)).toBe(true);
    expect(quantidadeValida(1000000000)).toBe(false);
  });
});
