// apps/api/src/modules/auth/__tests__/auth.plataforma.presenter.spec.ts

import { serializarSessaoPlataforma } from "@core-kit/api/modules/auth/auth.plataforma.presenter";
import { describe, expect, it } from "vitest";


describe("auth.plataforma.presenter", () => {
  it("#1 - deve serializar sessão de plataforma com refresh token, sem permissões, papéis ou módulos", () => {
    const dto = serializarSessaoPlataforma({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      accessExpiraEm: new Date("2026-05-11T10:00:00.000Z"),
      refreshExpiraEm: new Date("2026-05-11T11:00:00.000Z"),
      usuarioId: "usuario-plataforma-id" as any,
    });

    expect(dto).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      accessExpiraEm: "2026-05-11T10:00:00.000Z",
      refreshExpiraEm: "2026-05-11T11:00:00.000Z",
      usuario: {
        usuarioId: "usuario-plataforma-id",
        locatarioId: null,
        perfil: "PLATAFORMA",
      },
    });

    expect(dto).not.toHaveProperty("permissoes");
    expect(dto).not.toHaveProperty("papeis");
    expect(dto).not.toHaveProperty("modulos");
    expect(dto.usuario).not.toHaveProperty("permissoes");
    expect(dto.usuario).not.toHaveProperty("papeis");
    expect(dto.usuario).not.toHaveProperty("modulos");
  });
});
