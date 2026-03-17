import { describe, expect, it } from "vitest";
import { createObterLocatario } from "../../src/locatarios/usecases/obterLocatario";
import { criarLocatarioSeed, criarLocatariosRepositorioMemoria } from "../../src/locatarios/repositorioMemoria";

describe("obterLocatario", () => {
  it("obtém locatário ativo", async () => {
    const repo = criarLocatariosRepositorioMemoria([
      criarLocatarioSeed({
        locatarioId: "loc-1",
        nome: "Empresa A",
        status: "ATIVO",
      }),
    ]);

    const usecase = createObterLocatario({ locRepo: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.locatarioId).toBe("loc-1");
    expect(resultado.value.status).toBe("ATIVO");
  });

  it("falha quando locatário não existe", async () => {
    const repo = criarLocatariosRepositorioMemoria();
    const usecase = createObterLocatario({ locRepo: repo });

    const resultado = await usecase({ locatarioId: "loc-x" });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("LOCATARIO_NAO_ENCONTRADO");
  });

  it("falha quando locatário está suspenso", async () => {
    const repo = criarLocatariosRepositorioMemoria([
      criarLocatarioSeed({
        locatarioId: "loc-1",
        nome: "Empresa A",
        status: "SUSPENSO",
      }),
    ]);

    const usecase = createObterLocatario({ locRepo: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("LOCATARIO_SUSPENSO");
  });

  it("falha quando locatário está encerrado", async () => {
    const repo = criarLocatariosRepositorioMemoria([
      criarLocatarioSeed({
        locatarioId: "loc-1",
        nome: "Empresa A",
        status: "ENCERRADO",
      }),
    ]);

    const usecase = createObterLocatario({ locRepo: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("LOCATARIO_ENCERRADO");
  });
});