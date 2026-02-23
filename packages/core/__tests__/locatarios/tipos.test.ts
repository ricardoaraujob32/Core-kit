import { describe, it, expect } from "vitest";

import { criarLocatario, normalizarSlugLocatario, type LocatarioId, type PlanoId } from "../../src/locatarios";

const asLocatarioId = (v: string) => v as unknown as LocatarioId;
const asPlanoId = (v: string) => v as unknown as PlanoId;

describe("locatarios/tipos - criarLocatario", () => {
  it("deve criar locatário com status ATIVO e slug normalizado quando slug não for informado", () => {
    const agora = new Date("2026-01-01T00:00:00.000Z");

    const r = criarLocatario({
      id: asLocatarioId("l1"),
      nome: "Assistência Técnica do João",
      planoId: asPlanoId("p1"),
      agora: () => agora,
    });

    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.value.id).toBe("l1");
    expect(r.value.nome).toBe("Assistência Técnica do João");
    expect(r.value.planoId).toBe("p1");
    expect(r.value.status).toBe("ATIVO");
    expect(r.value.slug).toBe(normalizarSlugLocatario("Assistência Técnica do João"));
    expect(r.value.criadoEm.toISOString()).toBe(agora.toISOString());
    expect(r.value.atualizadoEm.toISOString()).toBe(agora.toISOString());
    expect(r.value.excluidoEm).toBeNull();
    expect(r.value.excluidoPorUsuarioId).toBeNull();
    expect(r.value.motivoExclusao).toBeNull();
  });

  it("deve aceitar slug informado e normalizar", () => {
    const agora = new Date("2026-01-01T00:00:00.000Z");

    const r = criarLocatario({
      id: asLocatarioId("l1"),
      nome: "Empresa X",
      planoId: asPlanoId("p1"),
      slug: " Empresa X - 01 ",
      agora: () => agora,
    });

    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.value.slug).toBe("empresa-x-01");
  });

  it("deve falhar se nome for vazio", () => {
    const r = criarLocatario({
      id: asLocatarioId("l1"),
      nome: "   ",
      planoId: asPlanoId("p1"),
      agora: () => new Date(),
    });

    expect(r.ok).toBe(false);
    if (r.ok) return;

    expect(r.error.codigo).toBe("INVALIDO");
  });

  it("deve falhar se slug normalizado ficar vazio", () => {
    const r = criarLocatario({
      id: asLocatarioId("l1"),
      nome: "Empresa X",
      planoId: asPlanoId("p1"),
      slug: "   ###   ",
      agora: () => new Date(),
    });

    expect(r.ok).toBe(false);
    if (r.ok) return;

    expect(r.error.codigo).toBe("INVALIDO");
  });
});