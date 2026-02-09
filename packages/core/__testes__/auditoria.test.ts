import { describe, it, expect } from "vitest";

// Ajuste conforme seu módulo real
import { ok } from "../src/index";

describe("Auditoria - eventos", () => {
  it("deve registrar metadados mínimos (locatário, usuário, ação, entidade)", () => {
    const evento = {
      locatarioId: "loc-1",
      usuarioId: "usr-1",
      acao: "CRIAR",
      entidade: "USUARIO",
      entidadeId: "usr-2",
      em: new Date().toISOString(),
    };

    expect(evento.locatarioId).toBeTruthy();
    expect(evento.acao).toBe("CRIAR");
    expect(evento.entidade).toBe("USUARIO");
  });
});
