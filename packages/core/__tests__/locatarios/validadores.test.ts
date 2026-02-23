import { describe, it, expect } from "vitest";
import { validarCriarLocatarioInput, validarSlugLocatario, validarModoTema } from "../../src/locatarios/validadores";

describe("locatarios/validadores", () => {
  it("validarCriarLocatarioInput: deve aceitar nome/planoId/slug válidos", () => {
    const r = validarCriarLocatarioInput({
      nome: "Minha Loja",
      planoId: "plano-1",
      slug: "minha-loja",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.nome).toBe("Minha Loja");
      expect(r.value.planoId).toBe("plano-1");
      expect(r.value.slug).toBe("minha-loja");
    }
  });

  it("validarCriarLocatarioInput: deve falhar se nome vazio", () => {
    const r = validarCriarLocatarioInput({
      nome: "   ",
      planoId: "plano-1",
      slug: "minha-loja",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
      expect(r.error.detalhes).toMatchObject({ campo: "nome" });
    }
  });

  it("validarCriarLocatarioInput: deve falhar se planoId vazio", () => {
    const r = validarCriarLocatarioInput({
      nome: "Minha Loja",
      planoId: "  ",
      slug: "minha-loja",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
      expect(r.error.detalhes).toMatchObject({ campo: "planoId" });
    }
  });

  it("validarSlugLocatario: deve falhar se contiver maiúscula ou espaço", () => {
    const r = validarSlugLocatario("Minha Loja");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
      expect(r.error.detalhes).toMatchObject({ campo: "slug" });
    }
  });

  it("validarSlugLocatario: deve aceitar slug com a-z0-9 e hífen", () => {
    const r = validarSlugLocatario("assistencia-tecnica-123");

    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("assistencia-tecnica-123");
  });

  it("validarModoTema: deve aceitar CLARO/ESCURO/SISTEMA", () => {
    const r1 = validarModoTema("CLARO");
    const r2 = validarModoTema("ESCURO");
    const r3 = validarModoTema("SISTEMA");

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);
  });

  it("validarModoTema: deve rejeitar valor fora do enum", () => {
    const r = validarModoTema("AZUL" as any);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
      expect(r.error.detalhes).toMatchObject({ campo: "modoTema" });
    }
  });
});