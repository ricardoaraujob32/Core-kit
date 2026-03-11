import { describe, it, expect } from "vitest";
import { criarObterUsuario } from "../../src/usuarios/usecases/obterUsuario";
import {
  criarUsuarioSeed,
  criarUsuariosRepositorioMemoria,
} from "../../src/usuarios/repositorioMemoria";

describe("usuarios - obterUsuario", () => {
  it("retorna Ok quando usuário existe", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "usr-1",
        locatarioId: "tenant-1",
        email: "admin@teste.com",
        senhaHash: "hash-seguro",
      }),
    ]);

    const obterUsuario = criarObterUsuario({
      usuariosRepo: repo,
    });

    const r = await obterUsuario({
      locatarioId: "tenant-1",
      usuarioId: "usr-1",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.usuarioId).toBe("usr-1");
      expect(r.value.email).toBe("admin@teste.com");
    }
  });

  it("retorna Err(NAO_ENCONTRADO) quando usuário não existe", async () => {
    const repo = criarUsuariosRepositorioMemoria();

    const obterUsuario = criarObterUsuario({
      usuariosRepo: repo,
    });

    const r = await obterUsuario({
      locatarioId: "tenant-1",
      usuarioId: "usr-999",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_ENCONTRADO");
    }
  });

  it("retorna Err(INVALIDO) quando usuarioId é vazio", async () => {
    const repo = criarUsuariosRepositorioMemoria();

    const obterUsuario = criarObterUsuario({
      usuariosRepo: repo,
    });

    const r = await obterUsuario({
      locatarioId: "tenant-1",
      usuarioId: "",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("não encontra usuário de outro locatário", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "usr-1",
        locatarioId: "tenant-1",
        email: "admin@teste.com",
        senhaHash: "hash-seguro",
      }),
    ]);

    const obterUsuario = criarObterUsuario({
      usuariosRepo: repo,
    });

    const r = await obterUsuario({
      locatarioId: "tenant-2",
      usuarioId: "usr-1",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_ENCONTRADO");
    }
  });

  it("propaga erro do repositório", async () => {
    const obterUsuario = criarObterUsuario({
      usuariosRepo: {
        async criar() {
          throw new Error("não usado");
        },
        async buscarPorId() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao buscar usuário",
            },
          };
        },
        async buscarPorEmail() {
          throw new Error("não usado");
        },
        async listar() {
          throw new Error("não usado");
        },
        async atualizarUltimoLogin() {
          throw new Error("não usado");
        },
      },
    });

    const r = await obterUsuario({
      locatarioId: "tenant-1",
      usuarioId: "usr-1",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });
});