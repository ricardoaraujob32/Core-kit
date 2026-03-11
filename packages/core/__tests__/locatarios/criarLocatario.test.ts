import { describe, it, expect } from "vitest";
import { criarCriarLocatario } from "../../src/locatarios/usecases/criarLocatario";
import { criarLocatariosRepositorioMemoria } from "../../src/locatarios/repositorioMemoria";

describe("locatarios - criarLocatario", () => {
  it("cria locatário com sucesso", async () => {
    const repo = criarLocatariosRepositorioMemoria();

    const criarLocatario = criarCriarLocatario({
      locRepo: repo,
    });

    const r = await criarLocatario({
      nome: "Loja Centro",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.locatarioId).toBe("loc-1");
    }

    const dump = repo.dump();
    expect(dump).toHaveLength(1);
    expect(dump[0].nome).toBe("Loja Centro");
    expect(dump[0].status).toBe("ATIVO");
  });

  it("retorna Err(INVALIDO) quando nome é vazio", async () => {
    const repo = criarLocatariosRepositorioMemoria();

    const criarLocatario = criarCriarLocatario({
      locRepo: repo,
    });

    const r = await criarLocatario({
      nome: "",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("retorna Err(INVALIDO) quando nome é muito curto", async () => {
    const repo = criarLocatariosRepositorioMemoria();

    const criarLocatario = criarCriarLocatario({
      locRepo: repo,
    });

    const r = await criarLocatario({
      nome: "A",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("propaga erro do repositório", async () => {
    const criarLocatario = criarCriarLocatario({
      locRepo: {
        async criar() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao criar locatário",
            },
          };
        },
        async buscarPorId() {
          throw new Error("não usado");
        },
        async listar() {
          throw new Error("não usado");
        },
      },
    });

    const r = await criarLocatario({
      nome: "Loja Centro",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });
});