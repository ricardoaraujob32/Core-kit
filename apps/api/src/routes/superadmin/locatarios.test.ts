import { describe, it, expect } from "vitest";
import { criarServidor } from "../../server";

describe("rotas /superadmin/locatarios", () => {
  it("nega acesso sem permissao de superadmin", async () => {
    const app = await criarServidor();

    const res = await app.inject({
      method: "POST",
      url: "/superadmin/locatarios",
      payload: { nome: "Tenant A", slug: "tenant-a" },
      headers: {
        "x-permissoes": "usuarios:criar", // sem superadmin
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it("permite acesso com superadmin:acesso", async () => {
    const app = await criarServidor();

    const res = await app.inject({
      method: "POST",
      url: "/superadmin/locatarios",
      payload: { nome: "Tenant A", slug: "tenant-a" },
      headers: {
        "x-permissoes": "superadmin:acesso",
        "x-usuario-id": "user-superadmin",
      },
    });

    // aqui depende do seu usecase real.
    // se ele estiver implementado, deve retornar 200/204 conforme seu wrapRoute.
    expect([200, 204, 400, 409]).toContain(res.statusCode);
  });
});