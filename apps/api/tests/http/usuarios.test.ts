import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildServer } from "../../src/app";

describe("Usuarios HTTP", () => {
  const appPromise = buildServer();

  beforeAll(async () => {
    const app = await appPromise;
    await app.ready();
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("POST /usuarios deve criar usuário no tenant informado", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "POST",
      url: "/usuarios",
      headers: {
        "x-locatario-id": "tenant-1",
        "x-usuario-id": "admin-1"
      },
      payload: {
        nome: "Usuário Teste",
        email: "usuario@teste.com"
      }
    });

    expect([200, 201]).toContain(response.statusCode);
  });

  it("GET /usuarios sem tenant deve falhar", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "GET",
      url: "/usuarios"
    });

    expect([400, 401, 403]).toContain(response.statusCode);
  });
});