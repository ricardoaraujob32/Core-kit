import { describe, expect, it } from "vitest";
import { criarReativarUsuario } from "../usecases/reativarUsuario";
import {
  criarUsuarioSeed,
  criarUsuariosRepositorioMemoria,
} from "../repositorioMemoria";

describe("reativarUsuario", () => {
  it("reativa usuário", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "u1",
        locatarioId: "loc-1",
        email: "a@example.com",
        nome: "Usuário",
        status: "INATIVO",
      }),
    ]);

    const usecase = criarReativarUsuario({
      usuariosRepo: repo,
      relogio: { agora: () => new Date("2026-03-12T12:00:00.000Z") },
    });

    const resultado = await usecase({ usuarioId: "u1" });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("ATIVO");
  });
});