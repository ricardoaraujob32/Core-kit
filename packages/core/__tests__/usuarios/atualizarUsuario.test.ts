import { describe, expect, it } from "vitest";
import { criarAtualizarUsuario } from "../usecases/atualizarUsuario";
import {
  criarUsuarioSeed,
  criarUsuariosRepositorioMemoria,
} from "../repositorioMemoria";

describe("atualizarUsuario", () => {
  it("atualiza nome e email do usuário", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "u1",
        locatarioId: "loc-1",
        email: "old@example.com",
        nome: "Antigo",
      }),
    ]);

    const usecase = criarAtualizarUsuario({
      usuariosRepo: repo,
      relogio: { agora: () => new Date("2026-03-12T12:00:00.000Z") },
    });

    const resultado = await usecase({
      usuarioId: "u1",
      nome: "Novo Nome",
      email: "NEW@example.com",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.nome).toBe("Novo Nome");
    expect(resultado.value.email).toBe("new@example.com");
  });
});