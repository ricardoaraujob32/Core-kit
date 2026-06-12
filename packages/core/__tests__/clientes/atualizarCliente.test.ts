// packages/core/__tests__/clientes/atualizarCliente.test.ts

import { describe, expect, it } from "vitest";
import { createFnAtualizarCliente } from "../../src/clientes/usecases/atualizarCliente";
import {
  criarClienteTeste,
  criarClientesSimulacroRepositorio,
} from "./simulacros/clientesSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/clientesUsecaseTestUtils";

describe("#1 - createFnAtualizarCliente", () => {
  it("#1.1 - deve atualizar dados cadastrais do cliente", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnAtualizarCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
      nome: "Cliente Atualizado",
      documento: "987654321",
      email: "novo@example.com",
      telefone: "11888888888",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.cliente.nome).toBe("Cliente Atualizado");
      expect(resultado.value.cliente.email).toBe("novo@example.com");
      expect(resultado.value.cliente.atualizadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve preservar campos não informados", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({
        clienteId: "cliente-1",
        locatarioId: "loc-1",
        nome: "Cliente Original",
        email: "original@example.com",
      }),
    ]);

    const usecase = createFnAtualizarCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
      nome: "Cliente Atualizado",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.cliente.nome).toBe("Cliente Atualizado");
      expect(resultado.value.cliente.email).toBe("original@example.com");
    }
  });

  it("#1.3 - deve falhar quando cliente não existe", async () => {
    const repo = criarClientesSimulacroRepositorio();

    const usecase = createFnAtualizarCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-x",
      nome: "Cliente Atualizado",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando nome informado é inválido", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnAtualizarCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
      nome: " ",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
    ]);
    repo.simularFalha("atualizar");

    const usecase = createFnAtualizarCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
      nome: "Cliente Atualizado",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
