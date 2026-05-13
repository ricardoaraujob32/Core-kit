// packages/core/__tests__/clientes/obterCliente.test.ts

import { describe, expect, it } from "vitest";
import { createFnObterCliente } from "../../src/clientes/usecases/obterCliente";
import {
  criarClienteTeste,
  criarClientesSimulacroRepositorio,
} from "./simulacros/clientesSimulacroRepositorio";

describe("#1 - createFnObterCliente", () => {
  it("#1.1 - deve obter cliente existente", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnObterCliente({ clientesRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.cliente.clienteId).toBe("cliente-1");
  });

  it("#1.2 - deve falhar quando cliente não existe", async () => {
    const repo = criarClientesSimulacroRepositorio();
    const usecase = createFnObterCliente({ clientesRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-x",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando cliente pertence a outro locatário", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-2" }),
    ]);

    const usecase = createFnObterCliente({ clientesRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando cliente está excluído logicamente", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({
        clienteId: "cliente-1",
        locatarioId: "loc-1",
        excluidoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnObterCliente({ clientesRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao buscar", async () => {
    const repo = criarClientesSimulacroRepositorio();
    repo.simularFalha("buscarPorId");

    const usecase = createFnObterCliente({ clientesRepositorio: repo });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
