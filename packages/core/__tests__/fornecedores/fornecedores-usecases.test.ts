import { describe, it, expect } from "vitest";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { isOk, isErr } from "../../src/result";
import { criarRepositorioFornecedoresEmMemoria } from "../../src/fornecedores/repositorioMemoria";
import { criarFornecedor } from "../../src/fornecedores/usecases/criarFornecedor";
import { listarFornecedores } from "../../src/fornecedores/usecases/listarFornecedores";

describe("Fornecedores - casos de uso", () => {
  it("criarFornecedor deve exigir permissão", async () => {
    const fornecedoresRepo = criarRepositorioFornecedoresEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: [],
    });

    const r = await criarFornecedor(ctx, { fornecedoresRepo }, { nome: "Distribuidora Central" });
    expect(isErr(r)).toBe(true);
  });

  it("criarFornecedor deve validar nome", async () => {
    const fornecedoresRepo = criarRepositorioFornecedoresEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["FORNECEDORES_CRIAR"],
    });

    const r = await criarFornecedor(ctx, { fornecedoresRepo }, { nome: "" });
    expect(isErr(r)).toBe(true);
  });

  it("criarFornecedor deve validar email opcional", async () => {
    const fornecedoresRepo = criarRepositorioFornecedoresEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["FORNECEDORES_CRIAR"],
    });

    const r = await criarFornecedor(ctx, { fornecedoresRepo }, { nome: "Distribuidora Central", email: "invalido" });
    expect(isErr(r)).toBe(true);
  });

  it("criarFornecedor deve criar e impedir duplicidade por nome no mesmo locatário", async () => {
    const fornecedoresRepo = criarRepositorioFornecedoresEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["FORNECEDORES_CRIAR"],
    });

    const a = await criarFornecedor(ctx, { fornecedoresRepo }, { nome: "  Distribuidora   Central " });
    expect(isOk(a)).toBe(true);

    const b = await criarFornecedor(ctx, { fornecedoresRepo }, { nome: "Distribuidora Central" });
    expect(isErr(b)).toBe(true);
  });

  it("listarFornecedores deve exigir permissão", async () => {
    const fornecedoresRepo = criarRepositorioFornecedoresEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: [],
    });

    const r = await listarFornecedores(ctx, { fornecedoresRepo });
    expect(isErr(r)).toBe(true);
  });

  it("listarFornecedores deve retornar lista do locatário", async () => {
    const fornecedoresRepo = criarRepositorioFornecedoresEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["FORNECEDORES_CRIAR", "FORNECEDORES_LER"],
    });

    await criarFornecedor(ctx, { fornecedoresRepo }, { nome: "Fornecedor A" });
    await criarFornecedor(ctx, { fornecedoresRepo }, { nome: "Fornecedor B" });

    const r = await listarFornecedores(ctx, { fornecedoresRepo });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value.itens.length).toBe(2);
  });
});
