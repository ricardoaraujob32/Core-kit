// packages/core/__tests__/kernel/utils.test.ts

import { describe, expect, it } from "vitest";
import { normalizarEmail, validarData, validarEmail, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio } from "../../src/kernel";

describe("#1 - validadores transversais", () => {
  it("#1.1 - validarTextoObrigatorio deve normalizar texto válido", () => {
    const resultado = validarTextoObrigatorio("  Teste  ", "nome", 2);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value).toBe("Teste");
  });

  it("#1.2 - validarTextoObrigatorio deve rejeitar texto vazio", () => {
    const resultado = validarTextoObrigatorio(" ", "nome", 2);

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - validarIdGenerico deve validar string não vazia", () => {
    expect(validarIdGenerico("id-1", "id").ok).toBe(true);
    expect(validarIdGenerico("", "id").ok).toBe(false);
  });

  it("#1.4 - normalizarEmail deve aplicar trim e lower case", () => {
    expect(normalizarEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
  });

  it("#1.5 - validarEmail deve validar e normalizar e-mail", () => {
    const resultado = validarEmail("  USER@EXAMPLE.COM  ");

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value).toBe("user@example.com");
  });

  it("#1.6 - validarEmail deve rejeitar e-mail inválido", () => {
    expect(validarEmail("email-invalido").ok).toBe(false);
  });

  it("#1.7 - validarData deve aceitar Date válida e rejeitar inválida", () => {
    expect(validarData(new Date("2026-01-01T00:00:00.000Z"), "data").ok).toBe(true);
    expect(validarData(new Date("invalid"), "data").ok).toBe(false);
  });

  it("#1.8 - validarNumeroPositivo deve aceitar apenas número positivo finito", () => {
    expect(validarNumeroPositivo(1, "valor").ok).toBe(true);
    expect(validarNumeroPositivo(0, "valor").ok).toBe(false);
    expect(validarNumeroPositivo(-1, "valor").ok).toBe(false);
    expect(validarNumeroPositivo(Number.POSITIVE_INFINITY, "valor").ok).toBe(false);
  });
});