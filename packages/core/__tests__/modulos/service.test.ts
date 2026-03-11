import { describe, expect, it } from "vitest";
import { isErr } from "@core-kit/core";

import {
  criarModulosHabilitadosRepositorioMemoria,
} from "../../src/modulosHabilitados/repositorioMemoria";

import {
  criarModulosHabilitadosService,
} from "../../src/modulosHabilitados/usecases/modulosHabilitadosService";

describe("ModulosHabilitadosService", () => {
  const repo = criarModulosHabilitadosRepositorioMemoria({
    "loc-1": [
      { codigo: "ESTOQUE", origem: "MANUAL" },
      { codigo: "FINANCEIRO", origem: "PLANO" },
    ],
  });

  const service = criarModulosHabilitadosService(repo);

  it("deve listar módulos habilitados", async () => {
    const result = await service.listarModulosHabilitados({
      locatarioId: "loc-1",
    });

    expect(isErr(result)).toBe(false);

    if (!isErr(result)) {
      expect(result.value.modulos.length).toBe(2);
    }
  });

  it("deve detectar módulo habilitado", async () => {
    const result = await service.moduloEstaHabilitado({
      locatarioId: "loc-1",
      codigo: "ESTOQUE",
    });

    expect(isErr(result)).toBe(false);

    if (!isErr(result)) {
      expect(result.value.habilitado).toBe(true);
    }
  });

  it("deve detectar módulo não habilitado", async () => {
    const result = await service.moduloEstaHabilitado({
      locatarioId: "loc-1",
      codigo: "RELATORIOS",
    });

    expect(isErr(result)).toBe(false);

    if (!isErr(result)) {
      expect(result.value.habilitado).toBe(false);
    }
  });

  it("deve falhar ao exigir módulo inexistente", async () => {
    const result = await service.exigirModuloHabilitado({
      locatarioId: "loc-1",
      codigo: "RELATORIOS",
    });

    expect(isErr(result)).toBe(true);
  });

  it("deve permitir exigir módulo existente", async () => {
    const result = await service.exigirModuloHabilitado({
      locatarioId: "loc-1",
      codigo: "ESTOQUE",
    });

    expect(isErr(result)).toBe(false);
  });
});