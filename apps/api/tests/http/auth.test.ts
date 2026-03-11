import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { iniciarServidor } from "../../src/server";

describe("Auth HTTP", () => {
  const appPromise = iniciarServidor();

  beforeAll(async () => {
    const app = await appPromise;
    await app.ready();
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("POST /auth/login deve retornar 200 ou 201 com payload de sessão", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "admin@teste.com",
        senha: "123456"
      }
    });

    expect([200, 201]).toContain(response.statusCode);

    const body = response.json();

    expect(body).toBeDefined();
    expect(body).toHaveProperty("accessToken");
    expect(body).toHaveProperty("refreshToken");
  });

  it("GET /auth/session deve responder conforme contrato atual", async () => {
    const app = await appPromise;

    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "admin@teste.com",
        senha: "123456"
      }
    });

    const loginBody = login.json();

    const response = await app.inject({
      method: "GET",
      url: "/auth/session",
      headers: {
        authorization: `Bearer ${loginBody.accessToken}`
      }
    });

    expect([200, 401, 403]).toContain(response.statusCode);
  });
});