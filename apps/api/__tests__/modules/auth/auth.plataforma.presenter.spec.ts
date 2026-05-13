// apps/api/src/modules/auth/__tests__/auth.plataforma.presenter.spec.ts

import { serializarSessaoPlataforma } from "@core-kit/api/modules/auth/auth.plataforma.presenter";
import { describe, expect, it } from "vitest";


describe("auth.plataforma.presenter", () => {
  it("#1 - deve serializar sessão de plataforma sem refresh token, permissões, papéis ou módulos", () => {
    const dto = serializarSessaoPlataforma({
      accessToken: "access-token",
      accessExpiraEm: new Date("2026-05-11T10:00:00.000Z"),
      usuarioId: "usuario-plataforma-id",
    });

    expect(dto).toEqual({
      accessToken: "access-token",
      accessExpiraEm: "2026-05-11T10:00:00.000Z",
      usuario: {
        usuarioId: "usuario-plataforma-id",
        locatarioId: null,
        perfil: "PLATAFORMA",
      },
    });

    expect(dto).not.toHaveProperty("refreshToken");
    expect(dto).not.toHaveProperty("refreshExpiraEm");
    expect(dto).not.toHaveProperty("permissoes");
    expect(dto).not.toHaveProperty("papeis");
    expect(dto).not.toHaveProperty("modulos");
    expect(dto.usuario).not.toHaveProperty("permissoes");
    expect(dto.usuario).not.toHaveProperty("papeis");
    expect(dto.usuario).not.toHaveProperty("modulos");
  });
});
