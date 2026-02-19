import { describe, it, expect } from "vitest";
import { nomeValido, normalizarNome } from "../../src/usuarios/validadores";

describe("Usuários - validadores", () => {
  it("normalizarNome deve padronizar espaços", () => {
    expect(normalizarNome("  João   Silva ")).toBe("João Silva");
  });

  it("nomeValido deve rejeitar vazio e curto", () => {
    expect(nomeValido("")).toBe(false);
    expect(nomeValido("  ")).toBe(false);
    expect(nomeValido("Jo")).toBe(false);
  });

  it("nomeValido deve aceitar nomes plausíveis", () => {
    expect(nomeValido("Ana Maria")).toBe(true);
    expect(nomeValido("João Silva")).toBe(true);
  });
});
