import { describe, it, expect } from "vitest";
import { criarLocatario } from "../../src/locatarios/usecases/criarLocatario";
import { atualizarPlanoLocatario } from "../../src/locatarios/usecases/atualizarPlanoLocatario";
import { excluirLogicamenteLocatario } from "../../src/locatarios/usecases/excluirLogicamenteLocatario";
import { obterLocatario } from "../../src/locatarios/usecases/obterLocatario";
import type { Locatario, LocatarioId } from "../../src/locatarios/tipos";
import type { PortasRepositorioLocatarios } from "../../src/locatarios/portasRepositorio";
import { wrapOk, wrapErr } from "../../src/result";
import { erroApp } from "../../src/erros";

function makeRepoMemoria(): PortasRepositorioLocatarios {
  const byId = new Map<string, Locatario>();
  const bySlug = new Map<string, Locatario>();

  return {
    async inserir(loc) {
      byId.set(loc.id, loc);
      bySlug.set(loc.slug, loc);
      return wrapOk(undefined);
    },
    async atualizar(loc) {
      byId.set(loc.id, loc);
      bySlug.set(loc.slug, loc);
      return wrapOk(undefined);
    },
    async obterPorId(id) {
      return wrapOk(byId.get(id) ?? null);
    },
    async obterPorSlug(slug) {
      return wrapOk(bySlug.get(slug) ?? null);
    },
    async existeSlug(slug) {
      return wrapOk(bySlug.has(slug));
    },
  };
}

describe("locatarios/usecases", () => {
  it("criarLocatario: deve criar locatário ATIVO e persistir", async () => {
    const repo = makeRepoMemoria();

    const r = await criarLocatario(
      { repo, gerarId: () => "loc-1", agora: () => new Date("2026-01-01T00:00:00Z") },
      { nome: "Minha Loja", planoId: "plano-1", slug: "minha-loja" },
    );

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.id).toBe("loc-1");
      expect(r.value.status).toBe("ATIVO");
      expect(r.value.slug).toBe("minha-loja");
    }

    const got = await repo.obterPorId("loc-1");
    expect(got.ok).toBe(true);
    if (got.ok) expect(got.value?.slug).toBe("minha-loja");
  });

  it("criarLocatario: deve falhar com CONFLITO se slug já existir", async () => {
    const repo = makeRepoMemoria();

    await repo.inserir({
      id: "loc-existente" as LocatarioId,
      nome: "X",
      planoId: "plano-1",
      slug: "minha-loja",
      status: "ATIVO",
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });

    const r = await criarLocatario(
      { repo, gerarId: () => "loc-2", agora: () => new Date("2026-01-01T00:00:00Z") },
      { nome: "Outra", planoId: "plano-1", slug: "minha-loja" },
    );

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("CONFLITO");
      expect(r.error.detalhes).toMatchObject({ campo: "slug" });
    }
  });

  it("obterLocatario: deve obter por id", async () => {
    const repo = makeRepoMemoria();
    await repo.inserir({
      id: "loc-1" as LocatarioId,
      nome: "Minha Loja",
      planoId: "plano-1",
      slug: "minha-loja",
      status: "ATIVO",
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });

    const r = await obterLocatario({ repo }, { id: "loc-1" as LocatarioId });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.slug).toBe("minha-loja");
  });

  it("obterLocatario: deve falhar com NAO_ENCONTRADO se não existir", async () => {
    const repo = makeRepoMemoria();

    const r = await obterLocatario({ repo }, { id: "nao-existe" as LocatarioId });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("NAO_ENCONTRADO");
  });

  it("atualizarPlanoLocatario: deve trocar planoId e atualizar atualizadoEm", async () => {
    const repo = makeRepoMemoria();
    await repo.inserir({
      id: "loc-1" as LocatarioId,
      nome: "Minha Loja",
      planoId: "plano-1",
      slug: "minha-loja",
      status: "ATIVO",
      criadoEm: new Date("2026-01-01T00:00:00Z"),
      atualizadoEm: new Date("2026-01-01T00:00:00Z"),
    });

    const r = await atualizarPlanoLocatario(
      { repo, agora: () => new Date("2026-01-02T00:00:00Z") },
      { locatarioId: "loc-1" as LocatarioId, novoPlanoId: "plano-2" },
    );

    expect(r.ok).toBe(true);

    const got = await repo.obterPorId("loc-1" as LocatarioId);
    expect(got.ok).toBe(true);
    if (got.ok && got.value) {
      expect(got.value.planoId).toBe("plano-2");
      expect(got.value.atualizadoEm.toISOString()).toBe("2026-01-02T00:00:00.000Z");
    }
  });

  it("excluirLogicamenteLocatario: deve marcar excluido_em e motivo e excluido_por", async () => {
    const repo = makeRepoMemoria();
    await repo.inserir({
      id: "loc-1" as LocatarioId,
      nome: "Minha Loja",
      planoId: "plano-1",
      slug: "minha-loja",
      status: "ATIVO",
      criadoEm: new Date("2026-01-01T00:00:00Z"),
      atualizadoEm: new Date("2026-01-01T00:00:00Z"),
    });

    const r = await excluirLogicamenteLocatario(
      { repo, agora: () => new Date("2026-01-03T00:00:00Z") },
      {
        locatarioId: "loc-1" as LocatarioId,
        excluidoPorUsuarioId: "usr-1",
        motivoExclusao: "Encerramento das atividades",
      },
    );

    expect(r.ok).toBe(true);

    const got = await repo.obterPorId("loc-1" as LocatarioId);
    expect(got.ok).toBe(true);
    if (got.ok && got.value) {
      expect(got.value.excluidoEm?.toISOString()).toBe("2026-01-03T00:00:00.000Z");
      expect(got.value.excluidoPorUsuarioId).toBe("usr-1");
      expect(got.value.motivoExclusao).toBe("Encerramento das atividades");
    }
  });

  it("usecases: se repo der ERRO_INTERNO, deve propagar Err", async () => {
    const repo: PortasRepositorioLocatarios = {
      async inserir() {
        return wrapErr(erroApp("ERRO_INTERNO", "Erro interno.", undefined, new Error("db down")));
      },
      async atualizar() {
        return wrapErr(erroApp("ERRO_INTERNO", "Erro interno.", undefined, new Error("db down")));
      },
      async obterPorId() {
        return wrapOk(null);
      },
      async obterPorSlug() {
        return wrapOk(null);
      },
      async existeSlug() {
        return wrapOk(false);
      },
    };

    const r = await criarLocatario(
      { repo, gerarId: () => "loc-1", agora: () => new Date() },
      { nome: "Minha Loja", planoId: "plano-1", slug: "minha-loja" },
    );

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.codigo).toBe("ERRO_INTERNO");
  });
});