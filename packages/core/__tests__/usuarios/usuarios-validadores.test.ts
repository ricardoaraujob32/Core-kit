import { describe, it, expect } from "vitest";

// Ajuste conforme seu index.ts / módulo usuarios
import { /* nomeValido, normalizeNome */ } from "../../src/index";

describe("Usuários - validações", () => {
  it("nome deve ser inválido quando vazio", () => {
    // troque pela sua função real
    const nomeValido = (s: string) => s.trim().length >= 2;
    expect(nomeValido("")).toBe(false);
    expect(nomeValido(" ")).toBe(false);
  });

  it("normalize deve padronizar espaços e casing (se aplicável)", () => {
    const normalizeNome = (s: string) => s.trim().replace(/\s+/g, " ");
    expect(normalizeNome("  João   Silva ")).toBe("João Silva");
  });
});
