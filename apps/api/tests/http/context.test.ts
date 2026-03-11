import { describe, it, expect } from "vitest";
import type { FastifyRequest } from "fastify";

import { buildContextFromRequest } from "../../src/http/context";

function mockRequest(headers: Record<string, unknown>): FastifyRequest {
  return {
    headers,
  } as FastifyRequest;
}

describe("HTTP Context Builder", () => {
  it("usa locatario-dev como default quando header não existe", () => {
    const req = mockRequest({});
    const ctx = buildContextFromRequest(req);

    expect(ctx.locatarioId).toBe("locatario-dev");
  });

  it("lê locatarioId do header", () => {
    const req = mockRequest({ "x-locatario-id": "acme" });
    const ctx = buildContextFromRequest(req);

    expect(ctx.locatarioId).toBe("acme");
  });

  it("usuarioId é undefined quando header não existe", () => {
    const req = mockRequest({});
    const ctx = buildContextFromRequest(req);

    expect(ctx.usuarioId).toBeUndefined();
  });

  it("usuarioId é lido corretamente com trim", () => {
    const req = mockRequest({ "x-usuario-id": "  user-123  " });
    const ctx = buildContextFromRequest(req);

    expect(ctx.usuarioId).toBe("user-123");
  });

  it("converte permissões CSV em array", () => {
    const req = mockRequest({
      "x-permissoes": "usuarios:listar,usuarios:criar",
    });
    const ctx = buildContextFromRequest(req);

    expect(ctx.permissoes).toEqual(["usuarios:listar", "usuarios:criar"]);
  });

  it("remove espaços e duplicadas nas permissões", () => {
    const req = mockRequest({
      "x-permissoes": " usuarios:listar , usuarios:listar , usuarios:criar ",
    });
    const ctx = buildContextFromRequest(req);

    expect(ctx.permissoes).toEqual(["usuarios:listar", "usuarios:criar"]);
  });

  it("permissoes vazias resultam em undefined", () => {
    const req = mockRequest({
      "x-permissoes": " ,  , ",
    });
    const ctx = buildContextFromRequest(req);

    expect(ctx.permissoes).toBeUndefined();
  });

  it("aceita headers como array (Fastify)", () => {
    const req = mockRequest({
      "x-locatario-id": ["acme"],
      "x-usuario-id": ["user-1"],
      "x-permissoes": ["usuarios:listar,usuarios:criar"],
    });
    const ctx = buildContextFromRequest(req);

    expect(ctx).toEqual({
      locatarioId: "acme",
      usuarioId: "user-1",
      permissoes: ["usuarios:listar", "usuarios:criar"],
    });
  });
});
