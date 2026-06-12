// packages/core/__tests__/clientes/excluirCliente.test.ts

import { describe, expect, it } from "vitest";
import { createFnExcluirCliente } from "../../src/clientes/usecases/excluirCliente";
import {
  criarClienteTeste,
  criarClientesSimulacroRepositorio,
} from "./simulacros/clientesSimulacroRepositorio";
import { DATA_TESTE, relogioTeste } from "./helpers/clientesUsecaseTestUtils";

describe("#1 - createFnExcluirCliente", () => {
  it("#1.1 - deve excluir logicamente cliente existente", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnExcluirCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
      excluidoPor: "usr-1",
      excluidoMotivo: " solicitação do usuário ",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.value.cliente.excluidoEm).toEqual(DATA_TESTE);
      expect(resultado.value.cliente.excluidoPor).toBe("usr-1");
      expect(resultado.value.cliente.excluidoMotivo).toBe("solicitação do usuário");
      expect(resultado.value.cliente.atualizadoEm).toEqual(DATA_TESTE);
    }
  });

  it("#1.2 - deve normalizar motivo vazio para null", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
    ]);

    const usecase = createFnExcluirCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
      excluidoMotivo: " ",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.value.cliente.excluidoMotivo).toBeNull();
  });

  it("#1.3 - deve falhar quando cliente não existe", async () => {
    const repo = criarClientesSimulacroRepositorio();

    const usecase = createFnExcluirCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-x",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.4 - deve falhar quando cliente já está excluído", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({
        clienteId: "cliente-1",
        locatarioId: "loc-1",
        excluidoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
    ]);

    const usecase = createFnExcluirCliente({
      clientesRepositorio: repo,
      relogio: relogioTeste,
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      clienteId: "cliente-1",
    });

    expect(resultado.ok).toBe(false);
  });

  it("#1.5 - deve propagar falha do repositório ao atualizar", async () => {
    const repo = criarClientesSimulacroRepositorio([
      criarClienteTeste({ clienteId: "cliente-1", locatarioId: "loc-1" }),
    ]);
    repo.simularFalha("atualizar");

    const usecase = createFnExcluirCliente({
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
