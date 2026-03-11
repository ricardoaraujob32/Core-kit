import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildServer } from "../../src/app";

describe("Locatarios HTTP", () => {
  const appPromise = buildServer();

  beforeAll(async () => {
    const app = await appPromise;
    await app.ready();
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("POST /superadmin/locatarios deve criar locatário", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "POST",
      url: "/superadmin/locatarios",
      headers: {
        "x-superadmin": "true"
      },
      payload: {
        nome: "Locatário Teste"
      }
    });

    expect([200, 201]).toContain(response.statusCode);

    const body = response.json();
    expect(body).toBeDefined();
  });

  it("GET /superadmin/locatarios sem x-superadmin deve negar acesso", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "GET",
      url: "/superadmin/locatarios"
    });

    expect([401, 403]).toContain(response.statusCode);
  });
});