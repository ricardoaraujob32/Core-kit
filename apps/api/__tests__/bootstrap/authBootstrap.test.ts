// apps/api/__tests__/bootstrap/authBootstrap.test.ts

import { describe, expect, it } from "vitest";
import { createAuthBootstrap, getAuthBootstrap } from "../../src/bootstrap/authBootstrap";

describe("#1 - authBootstrap", () => {
  it("#1.1 - deve criar bootstrap de auth com runtime oficial", () => {
    const bootstrap = createAuthBootstrap({
      eventos: {
        async registrarEvento() {},
      },
    });

    expect(bootstrap.runtime).toBeTruthy();

    expect(typeof bootstrap.runtime.emitirSessao).toBe("function");
    expect(typeof bootstrap.runtime.emitirSessaoPlataforma).toBe("function");
    expect(typeof bootstrap.runtime.validarSessao).toBe("function");
    expect(typeof bootstrap.runtime.rotacionarRefresh).toBe("function");
    expect(typeof bootstrap.runtime.logout).toBe("function");
  });

  it("#1.2 - deve expor a instância inicializada", () => {
    const bootstrap = createAuthBootstrap({
      eventos: {
        async registrarEvento() {},
      },
    });

    expect(getAuthBootstrap()).toBe(bootstrap);
  });
});