import { describe, expect, it } from "vitest";
import { criarInativarUsuario } from "../usecases/inativarUsuario";
import {
  criarUsuarioSeed,
  criarUsuariosRepositorioMemoria,
} from "../repositorioMemoria";

describe("inativarUsuario", () => {
  it("inativa usuário", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "u1",
        locatarioId: "loc-1",
        email: "a@example.com",
        nome: "Usuário",
        status: "ATIVO",
      }),
    ]);

    const usecase = criarInativarUsuario({
      usuariosRepo: repo,
      relogio: { agora: () => new Date("2026-03-12T12:00:00.000Z") },
    });

    const resultado = await usecase({ usuarioId: "u1" });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.status).toBe("INATIVO");
  });
});