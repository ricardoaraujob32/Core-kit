import { describe, it, expect } from "vitest";
import { criarCriarUsuario } from "../../src/usuarios/usecases/criarUsuario";
import {
  criarUsuarioSeed,
  criarUsuariosRepositorioMemoria,
} from "../../src/usuarios/repositorioMemoria";

describe("usuarios - criarUsuario", () => {
  it("cria usuário com sucesso", async () => {
    const repo = criarUsuariosRepositorioMemoria();

    const criarUsuario = criarCriarUsuario({
      usuariosRepo: repo,
    });

    const r = await criarUsuario({
      locatarioId: "tenant-1",
      email: "admin@teste.com",
      senhaHash: "hash-seguro",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.usuarioId).toBe("usr-1");
    }

    const dump = repo.dump();
    expect(dump).toHaveLength(1);
    expect(dump[0].email).toBe("admin@teste.com");
    expect(dump[0].status).toBe("ATIVO");
  });

  it("retorna Err(INVALIDO) quando email é inválido", async () => {
    const repo = criarUsuariosRepositorioMemoria();

    const criarUsuario = criarCriarUsuario({
      usuariosRepo: repo,
    });

    const r = await criarUsuario({
      locatarioId: "tenant-1",
      email: "",
      senhaHash: "hash-seguro",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("retorna Err(INVALIDO) quando senhaHash é vazia", async () => {
    const repo = criarUsuariosRepositorioMemoria();

    const criarUsuario = criarCriarUsuario({
      usuariosRepo: repo,
    });

    const r = await criarUsuario({
      locatarioId: "tenant-1",
      email: "admin@teste.com",
      senhaHash: "",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("retorna Err(CONFLITO) quando email já existe no locatário", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "usr-1",
        locatarioId: "tenant-1",
        email: "admin@teste.com",
        senhaHash: "hash-seguro",
      }),
    ]);

    const criarUsuario = criarCriarUsuario({
      usuariosRepo: repo,
    });

    const r = await criarUsuario({
      locatarioId: "tenant-1",
      email: "admin@teste.com",
      senhaHash: "outro-hash",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("CONFLITO");
    }
  });

  it("permite mesmo email em locatário diferente", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "usr-1",
        locatarioId: "tenant-1",
        email: "admin@teste.com",
        senhaHash: "hash-seguro",
      }),
    ]);

    const criarUsuario = criarCriarUsuario({
      usuariosRepo: repo,
    });

    const r = await criarUsuario({
      locatarioId: "tenant-2",
      email: "admin@teste.com",
      senhaHash: "outro-hash",
    });

    expect(r.ok).toBe(true);
  });

  it("propaga erro do repositório", async () => {
    const criarUsuario = criarCriarUsuario({
      usuariosRepo: {
        async criar() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao criar usuário",
            },
          };
        },
        async buscarPorId() {
          throw new Error("não usado");
        },
        async buscarPorEmail() {
          return { ok: true as const, value: null };
        },
        async listar() {
          throw new Error("não usado");
        },
        async atualizarUltimoLogin() {
          throw new Error("não usado");
        },
      },
    });

    const r = await criarUsuario({
      locatarioId: "tenant-1",
      email: "admin@teste.com",
      senhaHash: "hash-seguro",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });
});