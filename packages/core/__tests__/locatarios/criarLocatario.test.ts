import { describe, expect, it } from "vitest";
import { criarLocatariosRepositorioMemoria } from "../../src/locatarios/repositorioMemoria";
import { createCriarLocatario } from "../../src/locatarios/usecases/criarLocatario";


describe("criarLocatario", () => {
  it("cria locatário com nome válido", async () => {
    const repo = criarLocatariosRepositorioMemoria();

    const usecase = createCriarLocatario({
      locRepo: repo,
      idPorta: { gerarId: () => "loc-1" },
      relogio: { agora: () => new Date("2026-03-12T10:00:00.000Z") },
    });

    const resultado = await usecase({ nome: "Empresa A" });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.locatarioId).toBe("loc-1");
  });

  it("falha com nome inválido", async () => {
    const repo = criarLocatariosRepositorioMemoria();

    const usecase = createCriarLocatario({
      locRepo: repo,
      idPorta: { gerarId: () => "loc-1" },
      relogio: { agora: () => new Date("2026-03-12T10:00:00.000Z") },
    });

    const resultado = await usecase({ nome: " " });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("LOCATARIO_INVALIDO");
  });
});