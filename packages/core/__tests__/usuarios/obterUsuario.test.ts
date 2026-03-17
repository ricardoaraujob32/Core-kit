import { describe, expect, it } from "vitest";
import { criarObterUsuario } from "../usecases/obterUsuario";
import {
  criarUsuarioSeed,
  criarUsuariosRepositorioMemoria,
} from "../repositorioMemoria";

describe("obterUsuario", () => {
  it("obtém usuário ativo", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "user-1",
        locatarioId: "loc-1",
        email: "a@example.com",
        nome: "Usuário A",
        status: "ATIVO",
      }),
    ]);

    const usecase = criarObterUsuario({ usuariosRepo: repo });
    const resultado = await usecase({ usuarioId: "user-1" });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.usuarioId).toBe("user-1");
  });

  it("falha para usuário inativo", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "user-1",
        locatarioId: "loc-1",
        email: "a@example.com",
        nome: "Usuário A",
        status: "INATIVO",
      }),
    ]);

    const usecase = criarObterUsuario({ usuariosRepo: repo });
    const resultado = await usecase({ usuarioId: "user-1" });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("USUARIO_INATIVO");
  });
});