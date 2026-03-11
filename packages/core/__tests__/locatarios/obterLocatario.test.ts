import { describe, it, expect } from "vitest";
import { criarObterLocatario } from "../../src/locatarios/usecases/obterLocatario";
import {
  criarLocatarioSeed,
  criarLocatariosRepositorioMemoria,
} from "../../src/locatarios/repositorioMemoria";

describe("locatarios - obterLocatario", () => {
  it("retorna Ok quando locatário existe e está ATIVO", async () => {
    const repo = criarLocatariosRepositorioMemoria([
      criarLocatarioSeed({
        locatarioId: "loc-1",
        nome: "Loja Centro",
        status: "ATIVO",
      }),
    ]);

    const obterLocatario = criarObterLocatario({
      locRepo: repo,
    });

    const r = await obterLocatario({
      locatarioId: "loc-1",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.locatarioId).toBe("loc-1");
      expect(r.value.nome).toBe("Loja Centro");
      expect(r.value.status).toBe("ATIVO");
    }
  });

  it("retorna Err(NAO_ENCONTRADO) quando locatário não existe", async () => {
    const repo = criarLocatariosRepositorioMemoria();

    const obterLocatario = criarObterLocatario({
      locRepo: repo,
    });

    const r = await obterLocatario({
      locatarioId: "loc-999",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_ENCONTRADO");
    }
  });

  it("retorna Err(CONFLITO) quando locatário está SUSPENSO", async () => {
    const repo = criarLocatariosRepositorioMemoria([
      criarLocatarioSeed({
        locatarioId: "loc-1",
        nome: "Loja Centro",
        status: "SUSPENSO",
      }),
    ]);

    const obterLocatario = criarObterLocatario({
      locRepo: repo,
    });

    const r = await obterLocatario({
      locatarioId: "loc-1",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("CONFLITO");
      expect(r.error.detalhes).toMatchObject({
        status: "SUSPENSO",
      });
    }
  });

  it("retorna Err(CONFLITO) quando locatário está ENCERRADO", async () => {
    const repo = criarLocatariosRepositorioMemoria([
      criarLocatarioSeed({
        locatarioId: "loc-1",
        nome: "Loja Centro",
        status: "ENCERRADO",
      }),
    ]);

    const obterLocatario = criarObterLocatario({
      locRepo: repo,
    });

    const r = await obterLocatario({
      locatarioId: "loc-1",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("CONFLITO");
      expect(r.error.detalhes).toMatchObject({
        status: "ENCERRADO",
      });
    }
  });

  it("retorna Err(INVALIDO) quando locatarioId é vazio", async () => {
    const repo = criarLocatariosRepositorioMemoria();

    const obterLocatario = criarObterLocatario({
      locRepo: repo,
    });

    const r = await obterLocatario({
      locatarioId: "",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("propaga erro do repositório", async () => {
    const obterLocatario = criarObterLocatario({
      locRepo: {
        async criar() {
          throw new Error("não usado");
        },
        async listar() {
          throw new Error("não usado");
        },
        async buscarPorId() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao buscar locatário",
            },
          };
        },
      },
    });

    const r = await obterLocatario({
      locatarioId: "loc-1",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });
});