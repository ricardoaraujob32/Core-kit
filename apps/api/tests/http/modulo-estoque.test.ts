import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildServer } from "../../src/app";

describe("GET /estoque/ping", () => {
  const appPromise = buildServer();

  beforeAll(async () => {
    const app = await appPromise;
    await app.ready();
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("deve retornar 200 quando o locatário tem módulo ESTOQUE habilitado", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "GET",
      url: "/estoque/ping",
      headers: {
        "x-locatario-id": "locatario-demo",
        "x-usuario-id": "usuario-demo",
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body).toMatchObject({
      status: "ok",
      modulo: "ESTOQUE",
      locatarioId: "locatario-demo",
    });

    expect(body.modulosHabilitados).toContain("ESTOQUE");
  });

  it("deve retornar 403 quando o locatário não tem módulo ESTOQUE habilitado", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "GET",
      url: "/estoque/ping",
      headers: {
        "x-locatario-id": "locatario-basico",
        "x-usuario-id": "usuario-basico",
      },
    });

    expect(response.statusCode).toBe(403);

    const body = response.json();

    expect(body).toMatchObject({
      codigo: "NAO_AUTORIZADO",
    });
  });

  it("deve retornar 400 quando o cabeçalho x-locatario-id não for enviado", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "GET",
      url: "/estoque/ping",
      headers: {
        "x-usuario-id": "usuario-sem-tenant",
      },
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();

    expect(body).toMatchObject({
      codigo: "INVALIDO",
    });
  });
});