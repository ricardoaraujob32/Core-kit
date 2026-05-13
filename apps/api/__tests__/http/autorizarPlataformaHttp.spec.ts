// apps/api/src/http/__tests__/autorizarPlataformaHttp.spec.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

const contextMocks = vi.hoisted(() => ({
  buildContextoHttpFromRequest: vi.fn(),
}));

vi.mock("@core-kit/api/http/context", () => contextMocks);

import { autorizarPlataformaHttp } from "@core-kit/api/http/autorizarPlataformaHttp";

function criarReplyMock() {
  return {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
}

function criarRequestMock() {
  return {
    url: "/api/plataforma/locatarios",
    method: "GET",
    usuario: {
      usuarioId: "usuario-id",
      locatarioId: null,
      sessionId: "session-id",
      expiraEm: new Date("2026-05-11T10:00:00.000Z"),
    },
  };
}

describe("autorizarPlataformaHttp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("#1 - deve permitir usuário de plataforma", async () => {
    const contextoPlataforma = {
      tipo: "PLATAFORMA" as const,
      usuarioId: "usuario-plataforma-id",
      sessionId: "sessao-plataforma-id",
      expiraEm: new Date("2026-05-11T10:00:00.000Z"),
    };

    contextMocks.buildContextoHttpFromRequest.mockResolvedValueOnce({
      ok: true,
      value: contextoPlataforma,
    });

    const reply = criarReplyMock();

    const resultado = await autorizarPlataformaHttp(
      criarRequestMock() as any,
      reply as any,
    );

    expect(resultado).toBe(contextoPlataforma);
    expect(reply.status).not.toHaveBeenCalled();
    expect(reply.send).not.toHaveBeenCalled();
  });

  it("#2 - deve bloquear usuário tenant em rota de plataforma", async () => {
    contextMocks.buildContextoHttpFromRequest.mockResolvedValueOnce({
      ok: true,
      value: {
        tipo: "TENANT",
        ctx: {
          locatarioId: "locatario-id",
          usuarioId: "usuario-id",
          papeis: [],
          permissoes: [],
          modulosHabilitados: [],
        },
      },
    });

    const reply = criarReplyMock();

    const resultado = await autorizarPlataformaHttp(
      criarRequestMock() as any,
      reply as any,
    );

    expect(resultado).toBeNull();
    expect(reply.status).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith({
      erro: {
        codigo: "NAO_AUTORIZADO",
        mensagem: "Esta operação exige usuário de plataforma.",
        detalhes: {
          operacao: "http.autorizacao.plataforma",
        },
      },
    });
  });
});