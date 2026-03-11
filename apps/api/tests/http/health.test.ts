import { describe, it, expect, afterAll } from "vitest";
import { criarServidor } from "../../src/server";

describe("health endpoint", () => {

  it("should return ok", async () => {

    const app = await criarServidor();

    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);

    expect(body.status).toBe("ok");
  });

});

describe("GET /health", () => {
  const appPromise = criarServidor();

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("deve retornar status ok", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: "core-kit-api",
    });
  });
});