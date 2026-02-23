import { describe, it, expect } from "vitest";

import {
  criarConfiguracaoLocatario,
  type ConfiguracaoLocatarioId,
  type LocatarioId,
} from "../../src/locatarios";

const asLocatarioId = (v: string) => v as unknown as LocatarioId;
const asCfgId = (v: string) => v as unknown as ConfiguracaoLocatarioId;

describe("locatarios/configuracoes - criarConfiguracaoLocatario", () => {
  it("deve criar config com defaults (tema SISTEMA, idioma pt-BR, fuso America/Sao_Paulo, ativa false)", () => {
    const agora = new Date("2026-01-01T00:00:00.000Z");

    const r = criarConfiguracaoLocatario({
      locatarioId: asLocatarioId("l1"),
      configuracaoId: asCfgId("c1"),
      identidadeVisual: "Padrao",
      agora: () => agora,
    });

    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.value.locatarioId).toBe("l1");
    expect(r.value.configuracaoId).toBe("c1");
    expect(r.value.identidadeVisual).toBe("Padrao");
    expect(r.value.modoTema).toBe("SISTEMA");
    expect(r.value.ativa).toBe(false);
    expect(r.value.idioma).toBe("pt-BR");
    expect(r.value.fusoHorario).toBe("America/Sao_Paulo");
    expect(r.value.emailSuporte).toBeNull();
    expect(r.value.criadoEm.toISOString()).toBe(agora.toISOString());
    expect(r.value.atualizadoEm.toISOString()).toBe(agora.toISOString());
  });

  it("deve aceitar email válido", () => {
    const r = criarConfiguracaoLocatario({
      locatarioId: asLocatarioId("l1"),
      configuracaoId: asCfgId("c1"),
      identidadeVisual: "Marca A",
      emailSuporte: "suporte@empresa.com.br",
      agora: () => new Date(),
    });

    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.emailSuporte).toBe("suporte@empresa.com.br");
  });

  it("deve falhar com email inválido", () => {
    const r = criarConfiguracaoLocatario({
      locatarioId: asLocatarioId("l1"),
      configuracaoId: asCfgId("c1"),
      identidadeVisual: "Marca A",
      emailSuporte: "email_invalido",
      agora: () => new Date(),
    });

    expect(r.ok).toBe(false);
    if (r.ok) return;

    expect(r.error.codigo).toBe("INVALIDO");
  });

  it("deve falhar se identidadeVisual for vazia", () => {
    const r = criarConfiguracaoLocatario({
      locatarioId: asLocatarioId("l1"),
      configuracaoId: asCfgId("c1"),
      identidadeVisual: "   ",
      agora: () => new Date(),
    });

    expect(r.ok).toBe(false);
    if (r.ok) return;

    expect(r.error.codigo).toBe("INVALIDO");
  });
});