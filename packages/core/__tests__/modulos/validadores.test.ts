import { describe, expect, it } from "vitest";
import { isErr } from "@core-kit/core";

import {
  validarListarModulosHabilitadosInput,
  validarModuloEstaHabilitadoInput,
} from "../../src/modulosHabilitados/validadores";

describe("validarListarModulosHabilitadosInput", () => {
  it("deve aceitar locatarioId válido", () => {
    const result = validarListarModulosHabilitadosInput({
      locatarioId: "loc-1",
    });

    expect(isErr(result)).toBe(false);

    if (!isErr(result)) {
      expect(result.value.locatarioId).toBe("loc-1");
    }
  });

  it("deve falhar quando locatarioId estiver vazio", () => {
    const result = validarListarModulosHabilitadosInput({
      locatarioId: "",
    });

    expect(isErr(result)).toBe(true);
  });

  it("deve falhar quando locatarioId não for string", () => {
    const result = validarListarModulosHabilitadosInput({
      locatarioId: undefined as any,
    });

    expect(isErr(result)).toBe(true);
  });
});

describe("validarModuloEstaHabilitadoInput", () => {
  it("deve aceitar entrada válida", () => {
    const result = validarModuloEstaHabilitadoInput({
      locatarioId: "loc-1",
      codigo: "estoque",
    });

    expect(isErr(result)).toBe(false);

    if (!isErr(result)) {
      expect(result.value.codigo).toBe("ESTOQUE");
    }
  });

  it("deve falhar quando codigo estiver vazio", () => {
    const result = validarModuloEstaHabilitadoInput({
      locatarioId: "loc-1",
      codigo: "",
    });

    expect(isErr(result)).toBe(true);
  });

  it("deve falhar quando locatarioId estiver ausente", () => {
    const result = validarModuloEstaHabilitadoInput({
      locatarioId: "",
      codigo: "ESTOQUE",
    });

    expect(isErr(result)).toBe(true);
  });
});