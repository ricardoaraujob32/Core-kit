// packages/core/__tests__/clientes/listarClientes.test.ts

import { describe, expect, it } from "vitest";
import { createFnListarClientes } from "../../src/clientes/usecases/listarClientes";
import {
  criarClienteTeste,
  criarClientesSimulacroRepositorio,
} from "./simulacros/clientesSimulacroRepositorio";

describe("#1 - createFnListarClientes", () => {
  it("#1.1 - deve listar apenas clientes do locatário", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
      criarClienteTeste({ clienteId: "cliente-2", locatarioId: "loc-1" }),
      criarClienteTeste({ clienteId: "cliente-3", locatarioId: "loc-2" }),
    ]);

    const usecase = createFnListarClientes({ clientesRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((item) => item.clienteId)).toEqual([
        "cliente-1",
        "cliente-2",
      ]);
    }
  });

  it("#1.2 - deve respeitar cursor e limite", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
      criarClienteTeste({ clienteId: "cliente-2", locatarioId: "loc-1" }),
      criarClienteTeste({ clienteId: "cliente-3", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnListarClientes({ clientesRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      cursor: "cliente-1",
      limite: 1,
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((item) => item.clienteId)).toEqual(["cliente-2"]);
    }
  });

  it("#1.3 - deve retornar lista vazia quando não há registros", async () => {
    const repo = criarClientesSimulacroRepositorio();
    const usecase = createFnListarClientes({ clientesRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.itens).toEqual([]);
  });

  it("#1.4 - deve ignorar registros excluídos logicamente", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
      criarClienteTeste({
        clienteId: "cliente-2",
        locatarioId: "loc-1",
        excluidoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnListarClientes({ clientesRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.itens.map((item) => item.clienteId)).toEqual(["cliente-1"]);
    }
  });

  it("#1.5 - deve propagar falha do repositório ao listar", async () => {
    const repo = criarClientesSimulacroRepositorio();
    repo.simularFalha("listarPorLocatario");

    const usecase = createFnListarClientes({ clientesRepositorio: repo });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
