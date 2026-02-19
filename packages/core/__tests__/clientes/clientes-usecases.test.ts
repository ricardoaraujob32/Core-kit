import { describe, it, expect } from "vitest";
import { createContextoExecucao } from "../../src/contextoExecucao";
import { isOk, isErr } from "../../src/result";
import { criarRepositorioClientesEmMemoria } from "../../src/clientes/repositorioMemoria";
import { criarCliente } from "../../src/clientes/usecases/criarCliente";
import { listarClientes } from "../../src/clientes/usecases/listarClientes";

describe("Clientes - casos de uso", () => {
  it("criarCliente deve exigir permissão", async () => {
    const clientesRepo = criarRepositorioClientesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: [], // sem CLIENTES_CRIAR
    });

    const r = await criarCliente(ctx, { clientesRepo }, { nome: "Mercado Central" });
    expect(isErr(r)).toBe(true);
  });

  it("criarCliente deve validar nome", async () => {
    const clientesRepo = criarRepositorioClientesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["CLIENTES_CRIAR"],
    });

    const r = await criarCliente(ctx, { clientesRepo }, { nome: "" });
    expect(isErr(r)).toBe(true);
  });

  it("criarCliente deve validar email opcional", async () => {
    const clientesRepo = criarRepositorioClientesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["CLIENTES_CRIAR"],
    });

    const r = await criarCliente(ctx, { clientesRepo }, { nome: "Mercado Central", email: "invalido" });
    expect(isErr(r)).toBe(true);
  });

  it("criarCliente deve criar e impedir duplicidade por nome no mesmo locatário", async () => {
    const clientesRepo = criarRepositorioClientesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["CLIENTES_CRIAR"],
    });

    const a = await criarCliente(ctx, { clientesRepo }, { nome: "  Mercado   Central " });
    expect(isOk(a)).toBe(true);

    const b = await criarCliente(ctx, { clientesRepo }, { nome: "Mercado Central" });
    expect(isErr(b)).toBe(true);
  });

  it("listarClientes deve exigir permissão", async () => {
    const clientesRepo = criarRepositorioClientesEmMemoria();

    const ctx = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: [], // sem CLIENTES_LER
    });

    const r = await listarClientes(ctx, { clientesRepo });
    expect(isErr(r)).toBe(true);
  });

  it("listarClientes deve retornar lista do locatário", async () => {
    const clientesRepo = criarRepositorioClientesEmMemoria();

    const ctxCriar = createContextoExecucao({
      locatarioId: "L1",
      usuarioId: "U1",
      permissoes: ["CLIENTES_CRIAR", "CLIENTES_LER"],
    });

    await criarCliente(ctxCriar, { clientesRepo }, { nome: "Cliente A" });
    await criarCliente(ctxCriar, { clientesRepo }, { nome: "Cliente B" });

    const r = await listarClientes(ctxCriar, { clientesRepo });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value.itens.length).toBe(2);
  });
});
