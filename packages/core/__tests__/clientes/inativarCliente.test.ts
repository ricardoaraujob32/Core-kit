// packages/core/__tests__/clientes/inativarCliente.test.ts

import { describe, expect, it } from "vitest";
import { createFnInativarCliente } from "../../src/clientes/usecases/inativarCliente";
import {
  criarClienteTeste,
  criarClientesSimulacroRepositorio,
} from "./simulacros/clientesSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/clientesUsecaseTestUtils";

describe("#1 - createFnInativarCliente", () => {
  it("#1.1 - deve inativar cliente existente", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({
        clienteId: "cliente-1",
        locatarioId: "loc-1",
        status: "ATIVO",
      }),
    ]);

    const usecase = createFnInativarCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.cliente.status).toBe("INATIVO");
      expect(resultado.value.cliente.atualizadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve falhar quando cliente não existe", async () => {
    const repo = criarClientesSimulacroRepositorio();

    const usecase = createFnInativarCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-x",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.3 - deve falhar quando cliente está excluído logicamente", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({
        clienteId: "cliente-1",
        locatarioId: "loc-1",
        excluidoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnInativarCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
    ]);
    repo.simularFalha("atualizar");

    const usecase = createFnInativarCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.detalhes?.simulada).toBe(true);
  });
});
