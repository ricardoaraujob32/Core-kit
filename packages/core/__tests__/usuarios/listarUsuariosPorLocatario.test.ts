import { describe, expect, it } from "vitest";
import { criarListarUsuariosPorLocatario } from "../usecases/listarUsuariosPorLocatario";
import {
  criarUsuarioSeed,
  criarUsuariosRepositorioMemoria,
} from "../repositorioMemoria";

describe("listarUsuariosPorLocatario", () => {
  it("lista usuários do locatário ordenados por nome", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "u2",
        locatarioId: "loc-1",
        email: "b@example.com",
        nome: "Beta",
      }),
      criarUsuarioSeed({
        usuarioId: "u1",
        locatarioId: "loc-1",
        email: "a@example.com",
        nome: "Alpha",
      }),
      criarUsuarioSeed({
        usuarioId: "u3",
        locatarioId: "loc-2",
        email: "c@example.com",
        nome: "Gamma",
      }),
    ]);

    const usecase = criarListarUsuariosPorLocatario({
      usuariosRepo: repo,
    });

    const resultado = await usecase({ locatarioId: "loc-1" });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.itens).toHaveLength(2);
    expect(resultado.value.itens[0]?.nome).toBe("Alpha");
    expect(resultado.value.itens[1]?.nome).toBe("Beta");
  });
});