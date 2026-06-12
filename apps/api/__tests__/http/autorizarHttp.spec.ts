// apps/api/src/http/__tests__/autorizarHttp.spec.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

const contextMocks = vi.hoisted(() => ({
  buildContextFromRequest: vi.fn(),
  buildContextoHttpFromRequest: vi.fn(),
}));

vi.mock("@core-kit/api/http/context", () => contextMocks);

import { autorizarHttp } from "@core-kit/api/http/autorizarHttp";

function criarReplyMock() {
  return {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
}

function criarRequestMock(overrides: Record<string, unknown> = {}) {
  return {
    url: "/api/clientes",
    method: "GET",
    usuario: {
      usuarioId: "usuario-id",
      locatarioId: "locatario-id",
      sessionId: "session-id",
      expiraEm: new Date("2026-05-11T10:00:00.000Z"),
    },
    ...overrides,
  };
}

describe("autorizarHttp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("#1 - deve rejeitar política de plataforma em autorizarHttp", async () => {
    const reply = criarReplyMock();

    const resultado = await autorizarHttp(
      criarRequestMock({
        url: "/api/plataforma/locatarios",
      }) as any,
      reply as any,
      { exigePlataforma: true },
    );

    expect(resultado).toBeNull();

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      erro: {
        codigo: "INVALIDO",
        mensagem: "Rotas de plataforma devem usar autorizarPlataformaHttp.",
        detalhes: {
          operacao: "http.autorizacao.plataforma",
        },
      },
    });
  });

  it("#2 - deve rejeitar usuário de plataforma em rota tenant", async () => {
    const ctx = {
      locatarioId: "locatario-id",
      usuarioId: "usuario-plataforma-id",
      papeis: [],
      permissoes: [],
      modulosHabilitados: [],
    };

    contextMocks.buildContextFromRequest.mockResolvedValueOnce({
      ok: true,
      value: ctx,
    });

    contextMocks.buildContextoHttpFromRequest.mockResolvedValueOnce({
      ok: true,
      value: {
        tipo: "PLATAFORMA",
        usuarioId: "usuario-plataforma-id",
        sessionId: "sessao-plataforma-id",
        expiraEm: new Date("2026-05-11T10:00:00.000Z"),
      },
    });

    const reply = criarReplyMock();

    const resultado = await autorizarHttp(
      criarRequestMock() as any,
      reply as any,
    );

    expect(resultado).toBeNull();
    expect(reply.status).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({
      erro: {
        codigo: "NAO_AUTORIZADO",
        mensagem: "Usuário de plataforma não pode acessar rota de locatário sem escopo explícito.",
        detalhes: {
          operacao: "http.autorizacao.plataformaEmRotaTenant",
        },
      },
    });
  });

  it("#3 - deve permitir usuário tenant em rota tenant", async () => {
    const ctx = {
      locatarioId: "locatario-id",
      usuarioId: "usuario-id",
      papeis: [],
      permissoes: [],
      modulosHabilitados: [],
    };

    contextMocks.buildContextFromRequest.mockResolvedValueOnce({
      ok: true,
      value: ctx,
    });

    contextMocks.buildContextoHttpFromRequest.mockResolvedValueOnce({
      ok: true,
      value: {
        tipo: "TENANT",
        ctx,
      },
    });

    const reply = criarReplyMock();

    const resultado = await autorizarHttp(
      criarRequestMock() as any,
      reply as any,
    );

    expect(resultado).toBe(ctx);
    expect(reply.status).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });
});
