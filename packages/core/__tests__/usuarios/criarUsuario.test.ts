import { describe, expect, it } from "vitest";
import { criarCriarUsuario } from "../usecases/criarUsuario";
import { criarUsuariosRepositorioMemoria } from "../repositorioMemoria";

describe("criarUsuario", () => {
  it("cria usuário com dados válidos", async () => {
    const repo = criarUsuariosRepositorioMemoria();

    const usecase = criarCriarUsuario({
      usuariosRepo: repo,
      idPorta: { gerarId: () => "user-1" },
      relogio: { agora: () => new Date("2026-03-12T11:00:00.000Z") },
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      email: "USER@EXAMPLE.COM",
      nome: "Usuário A",
      senhaHash: "hash_super_seguro_mock_1234567890",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.usuarioId).toBe("user-1");
  });

  it("falha quando email já existe no locatário", async () => {
    const repo = criarUsuariosRepositorioMemoria();
    await repo.criar({
      usuarioId: "user-x",
      locatarioId: "loc-1",
      email: "user@example.com",
      nome: "Existente",
      senhaHash: "hash_super_seguro_mock_1234567890",
      status: "ATIVO",
      ultimoLoginEm: null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      excluidoEm: null,
    });

    const usecase = criarCriarUsuario({
      usuariosRepo: repo,
      idPorta: { gerarId: () => "user-1" },
      relogio: { agora: () => new Date("2026-03-12T11:00:00.000Z") },
    });

    const resultado = await usecase({
      locatarioId: "loc-1",
      email: "USER@example.com",
      nome: "Novo",
      senhaHash: "hash_super_seguro_mock_1234567890",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("USUARIO_EMAIL_JA_EXISTE");
  });
});