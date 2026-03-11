import { describe, it, expect } from "vitest";
import { criarListarUsuarios } from "../../src/usuarios/usecases/listarUsuarios";
import {
  criarUsuarioSeed,
  criarUsuariosRepositorioMemoria,
} from "../../src/usuarios/repositorioMemoria";

describe("usuarios - listarUsuarios", () => {
  it("lista usuários do locatário", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "usr-1",
        locatarioId: "tenant-1",
        email: "a@teste.com",
        senhaHash: "hash-a",
        criadoEm: new Date("2026-01-01T00:00:00.000Z"),
      }),
      criarUsuarioSeed({
        usuarioId: "usr-2",
        locatarioId: "tenant-1",
        email: "b@teste.com",
        senhaHash: "hash-b",
        criadoEm: new Date("2026-01-02T00:00:00.000Z"),
      }),
      criarUsuarioSeed({
        usuarioId: "usr-3",
        locatarioId: "tenant-2",
        email: "c@teste.com",
        senhaHash: "hash-c",
      }),
    ]);

    const listarUsuarios = criarListarUsuarios({
      usuariosRepo: repo,
    });

    const r = await listarUsuarios({
      locatarioId: "tenant-1",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.itens).toHaveLength(2);
      expect(r.value.itens[0].usuarioId).toBe("usr-1");
      expect(r.value.itens[1].usuarioId).toBe("usr-2");
    }
  });

  it("respeita o limite informado", async () => {
    const repo = criarUsuariosRepositorioMemoria([
      criarUsuarioSeed({
        usuarioId: "usr-1",
        locatarioId: "tenant-1",
        email: "a@teste.com",
        senhaHash: "hash-a",
      }),
      criarUsuarioSeed({
        usuarioId: "usr-2",
        locatarioId: "tenant-1",
        email: "b@teste.com",
        senhaHash: "hash-b",
      }),
    ]);

    const listarUsuarios = criarListarUsuarios({
      usuariosRepo: repo,
    });

    const r = await listarUsuarios({
      locatarioId: "tenant-1",
      limite: 1,
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.itens).toHaveLength(1);
    }
  });

  it("retorna Err(INVALIDO) quando limite é inválido", async () => {
    const repo = criarUsuariosRepositorioMemoria();

    const listarUsuarios = criarListarUsuarios({
      usuariosRepo: repo,
    });

    const r = await listarUsuarios({
      locatarioId: "tenant-1",
      limite: 0,
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("INVALIDO");
    }
  });

  it("propaga erro do repositório", async () => {
    const listarUsuarios = criarListarUsuarios({
      usuariosRepo: {
        async criar() {
          throw new Error("não usado");
        },
        async buscarPorId() {
          throw new Error("não usado");
        },
        async buscarPorEmail() {
          throw new Error("não usado");
        },
        async listar() {
          return {
            ok: false as const,
            error: {
              codigo: "ERRO_INTERNO",
              mensagem: "Falha ao listar usuários",
            },
          };
        },
        async atualizarUltimoLogin() {
          throw new Error("não usado");
        },
      },
    });

    const r = await listarUsuarios({
      locatarioId: "tenant-1",
    });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("ERRO_INTERNO");
    }
  });
});