// apps/api/__tests__/bootstrap/applicationBootstrap.test.ts

import { describe, expect, it, vi } from "vitest";
import Fastify from "fastify";

const bootstrapMocks = vi.hoisted(() => ({
  authBootstrap: {
    runtime: {
      emitirSessao: vi.fn(),
      emitirSessaoPlataforma: vi.fn(),
      validarSessao: vi.fn(),
      rotacionarRefresh: vi.fn(),
      logout: vi.fn(),
    },
  },

  authorizationBootstrap: {
    runtime: {
      resolverContextoAutorizado: vi.fn(),
      listarModulosHabilitados: vi.fn(),
    },
    catalogStore: {
      isReady: vi.fn(() => true),
    },
    warmup: vi.fn(async () => undefined),
    reloadCatalog: vi.fn(async () => undefined),
  },
}));

vi.mock("../../src/bootstrap/authBootstrap", () => ({
  createAuthBootstrap: vi.fn(() => bootstrapMocks.authBootstrap),
}));

vi.mock("../../src/bootstrap/authorizationBootstrap", () => ({
  createAuthorizationBootstrap: vi.fn(
    () => bootstrapMocks.authorizationBootstrap,
  ),
}));

import { runApplicationBootstrap } from "../../src/bootstrap/applicationBootstrap";

describe("applicationBootstrap", () => {
  it("deve decorar o app com auth e authorization", async () => {
    const app = Fastify();

    const bootstrap = await runApplicationBootstrap(app);

    expect(bootstrap.auth).toBe(bootstrapMocks.authBootstrap);
    expect(bootstrap.authorization).toBe(
      bootstrapMocks.authorizationBootstrap,
    );

    expect(app.applicationBootstrap.auth).toBe(bootstrap.auth);
    expect(app.applicationBootstrap.authorization).toBe(
      bootstrap.authorization,
    );

    expect(bootstrapMocks.authorizationBootstrap.warmup).toHaveBeenCalledTimes(
      1,
    );

    await app.close();
  });
});