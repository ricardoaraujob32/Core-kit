import { describe, expect, it } from "vitest";
import { isErr } from "@core-kit/core";

import {
  criarModulosHabilitadosRepositorioMemoria,
} from "../../src/modulosHabilitados/repositorioMemoria";

describe("ModulosHabilitadosRepositorioMemoria", () => {
  it("deve retornar módulos habilitados do locatário", async () => {
    const repo = criarModulosHabilitadosRepositorioMemoria({
      "loc-1": [
        { codigo: "ESTOQUE", origem: "MANUAL" },
        { codigo: "FINANCEIRO", origem: "PLANO" },
      ],
    });

    const result = await repo.listarPorLocatario("loc-1");

    expect(isErr(result)).toBe(false);

    if (!isErr(result)) {
      expect(result.value.length).toBe(2);
      expect(result.value[0].codigo).toBe("ESTOQUE");
    }
  });

  it("deve retornar lista vazia quando locatário não existir", async () => {
    const repo = criarModulosHabilitadosRepositorioMemoria({});

    const result = await repo.listarPorLocatario("loc-inexistente");

    expect(isErr(result)).toBe(false);

    if (!isErr(result)) {
      expect(result.value).toEqual([]);
    }
  });

  it("deve normalizar código de módulo para uppercase", async () => {
    const repo = criarModulosHabilitadosRepositorioMemoria({
      "loc-1": [
        { codigo: "estoque", origem: "MANUAL" },
      ],
    });

    const result = await repo.listarPorLocatario("loc-1");

    expect(isErr(result)).toBe(false);

    if (!isErr(result)) {
      expect(result.value[0].codigo).toBe("ESTOQUE");
    }
  });
});